import { IQuery, QueryFilter, IQueryFilter, IQueryOrFilter, Timeframe, AbsoluteTimeframe, Interval } from '../interfaces/Query'
import { Types } from 'mongoose'
import { Event } from '../models/Event'

const { ObjectId } = Types

// ---------------------------------------------------------------------------
// Timeframe parsing
// ---------------------------------------------------------------------------

function parseTimeframe(timeframe?: Timeframe, timezone?: string): { start: Date; end: Date } | null {
  if (!timeframe) return null

  if (typeof timeframe === 'object') {
    // AbsoluteTimeframe
    const abs = timeframe as AbsoluteTimeframe
    return { start: new Date(abs.start), end: new Date(abs.end) }
  }

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const tf = (timeframe as string).toLowerCase()

  if (tf === 'today') {
    return { start: todayStart, end: now }
  }

  if (tf === 'yesterday') {
    const start = new Date(todayStart)
    start.setDate(start.getDate() - 1)
    const end = new Date(todayStart)
    return { start, end }
  }

  if (tf === 'this_week') {
    const start = new Date(todayStart)
    start.setDate(start.getDate() - start.getDay())
    return { start, end: now }
  }

  if (tf === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start, end: now }
  }

  if (tf === 'this_year') {
    const start = new Date(now.getFullYear(), 0, 1)
    return { start, end: now }
  }

  // this_N_unit or last_N_unit or previous_N_unit
  const relMatch = tf.match(/^(this|last|previous)_(\d+)_(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)$/)
  if (relMatch) {
    const n = parseInt(relMatch[2], 10)
    const unit = relMatch[3].replace(/s$/, '') // normalize plural

    const start = new Date(now)
    if (unit === 'month') {
      start.setMonth(start.getMonth() - n)
    } else if (unit === 'year') {
      start.setFullYear(start.getFullYear() - n)
    } else {
      const msMap: Record<string, number> = {
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000
      }
      start.setTime(now.getTime() - n * (msMap[unit] || 24 * 60 * 60 * 1000))
    }
    return { start, end: now }
  }

  return null
}

// ---------------------------------------------------------------------------
// Filter translation
// ---------------------------------------------------------------------------

const translateSingleFilter = (filter: IQueryFilter): any => {
  switch (filter.operator) {
    case 'contains':
      return { $regex: filter.property_value, $options: 'i' }
    case 'not_contains':
      return { $not: { $regex: filter.property_value, $options: 'i' } }
    case 'regex':
      return { $regex: filter.property_value }
    case 'exists':
      return { $exists: filter.property_value !== false && filter.property_value !== 'false' }
    default:
      return { [`$${filter.operator}`]: filter.property_value }
  }
}

export const filtersToMongoQuery = (filters?: QueryFilter[]): any => {
  const mongoQuery: any = {}

  if (filters) {
    for (const filter of filters) {
      if (filter.operator !== 'or') {
        const queryFilter = filter as IQueryFilter
        mongoQuery[`data.${queryFilter.property_name}`] = translateSingleFilter(queryFilter)
      } else {
        const queryFilter = filter as IQueryOrFilter
        const orConditions = queryFilter.operands.map((f) => filtersToMongoQuery([f]))
        mongoQuery['$or'] = orConditions
      }
    }
  }

  return mongoQuery
}

// ---------------------------------------------------------------------------
// Interval to $dateTrunc unit
// ---------------------------------------------------------------------------

const intervalToUnit = (interval: Interval): string => {
  const map: Record<Interval, string> = {
    minutely: 'minute',
    hourly: 'hour',
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    yearly: 'year'
  }
  return map[interval] || 'day'
}


// ---------------------------------------------------------------------------
// Main query runner
// ---------------------------------------------------------------------------

export const runQuery = async (projectId: string, query: IQuery): Promise<any> => {
  const filters = filtersToMongoQuery(query.filters)

  // Build the $match stage
  const matchStage: any = {
    'metadata.projectId': new ObjectId(projectId),
    'metadata.collectionName': query.event_collection,
    ...filters
  }

  // Apply timeframe
  const timeRange = parseTimeframe(query.timeframe, query.timezone)
  if (timeRange) {
    matchStage['timestamp'] = { $gte: timeRange.start, $lt: timeRange.end }
  }

  // extraction — return raw documents
  if (query.analysis_type === 'extraction') {
    const pipeline: any[] = [{ $match: matchStage }]

    if (query.limit) {
      pipeline.push({ $limit: query.limit })
    }

    const events = await Event.aggregate(pipeline).exec()
    return { result: events }
  }

  // Build group _id
  const hasInterval = !!query.interval
  const hasGroupBy = !!query.group_by

  const groupId: any = {}

  if (hasInterval) {
    groupId['time_bucket'] = {
      $dateTrunc: { date: '$timestamp', unit: intervalToUnit(query.interval!) }
    }
  }

  if (hasGroupBy) {
    const groups = (Array.isArray(query.group_by) ? query.group_by : [query.group_by]) as string[]
    for (const g of groups) {
      groupId[g] = `$data.${g}`
    }
  }

  if (!hasInterval && !hasGroupBy) {
    // single scalar result — use null group
  }

  const target = query.target_property ? `$data.${query.target_property}` : null

  // Build accumulator
  let accumulator: any = {}
  switch (query.analysis_type) {
    case 'count':
      accumulator = { result: { $sum: 1 } }
      break
    case 'count_unique':
      accumulator = { _set: { $addToSet: target } }
      break
    case 'sum':
      accumulator = { result: { $sum: target } }
      break
    case 'average':
      accumulator = { result: { $avg: target } }
      break
    case 'minimum':
      accumulator = { result: { $min: target } }
      break
    case 'maximum':
      accumulator = { result: { $max: target } }
      break
    case 'median':
      accumulator = { _pct: { $percentile: { input: target, p: [0.5], method: 'approximate' } } }
      break
    case 'percentile':
      accumulator = { _pct: { $percentile: { input: target, p: [(query.percentile || 50) / 100], method: 'approximate' } } }
      break
    case 'select_unique':
      accumulator = { result: { $addToSet: target } }
      break
    default:
      accumulator = { result: { $sum: 1 } }
  }

  const groupStage: any = {
    _id: hasInterval || hasGroupBy ? groupId : null,
    ...accumulator
  }

  const pipeline: any[] = [
    { $match: matchStage },
    { $group: groupStage }
  ]

  // Post-process accumulator results
  const projectStage: any = { _id: 0 }

  if (hasInterval) {
    projectStage['timeframe'] = {
      start: '$_id.time_bucket',
      end: {
        $dateAdd: {
          startDate: '$_id.time_bucket',
          unit: intervalToUnit(query.interval!),
          amount: 1
        }
      }
    }
  }

  if (hasGroupBy) {
    const groups = (Array.isArray(query.group_by) ? query.group_by : [query.group_by]) as string[]
    for (const g of groups) {
      projectStage[g] = `$_id.${g}`
    }
  }

  // Handle special accumulator post-processing
  if (query.analysis_type === 'count_unique') {
    projectStage['result'] = { $size: '$_set' }
  } else if (query.analysis_type === 'median' || query.analysis_type === 'percentile') {
    projectStage['result'] = { $arrayElemAt: ['$_pct', 0] }
  } else {
    projectStage['result'] = '$result'
  }

  pipeline.push({ $project: projectStage })

  // Sort
  if (query.order_by) {
    const sortField = query.order_by.property_name
    const sortDir = query.order_by.direction === 'DESC' ? -1 : 1
    pipeline.push({ $sort: { [sortField]: sortDir } })
  } else if (hasInterval) {
    pipeline.push({ $sort: { 'timeframe.start': 1 } })
  }

  // Limit
  if (query.limit) {
    pipeline.push({ $limit: query.limit })
  }

  const results = await Event.aggregate(pipeline).exec()

  // Return shape
  if (!hasInterval && !hasGroupBy) {
    // Scalar result
    const scalar = results[0]?.result ?? 0
    return { result: scalar }
  }

  return { result: results }
}

// Keep backward-compatible analyzeCount export
export const analyzeCount = async (
  key: string,
  projectId: string,
  query: any
) => {
  return runQuery(projectId, { ...query, analysis_type: 'count' })
}
