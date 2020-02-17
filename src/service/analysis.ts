import {
  IQuery,
  QueryFilter,
  FilterOperators,
  IQueryFilter,
  IQueryOrFilter
} from '../interfaces/Query'
import { Types } from 'mongoose'
import { Event } from '../models/Event'
import ms from 'ms'

const { ObjectId } = Types

const translateFilter = (filter: IQueryFilter) => {
  switch (filter.operator) {
    case FilterOperators.contains:
      return { $regex: filter.property_value, $options: 'i' }

    case FilterOperators.not_contains:
      return { $not: { $regex: filter.property_value, $options: 'i' } }

    default:
      return { [`$${filter.operator}`]: filter.property_value }
  }
}

const objectToKvArray = (object: any) =>
  Object.keys(object).map(index => {
    let data = { [index]: object[index] }
    return data
  })

export const filtersToMongoQuery = (filters?: QueryFilter[]) => {
  let mongoQuery: any = {}

  if (filters) {
    for (const filter of filters) {
      console.log(filter)

      if (filter.operator !== FilterOperators.or) {
        const queryFilter = filter as IQueryFilter
        mongoQuery[`data.${queryFilter.property_name}`] = translateFilter(
          queryFilter
        )
      } else {
        const queryFilter = filter as IQueryOrFilter
        mongoQuery['$or'] = objectToKvArray(
          filtersToMongoQuery(queryFilter.operands)
        )
      }
    }
  }

  return mongoQuery
}

export const analyzeCount = async (
  key: string,
  projectId: string,
  query: IQuery
) => {
  const filters = filtersToMongoQuery(query.filters)

  const mongoQuery = {
    collectionName: query.event_collection,
    projectId: new ObjectId(projectId),
    ...filters
  }

  const interval = ms('1 day')

  const aggregation = [
    { $match: mongoQuery },
    {
      $project: {
        start: {
          $toDate: {
            $subtract: [
              { $toLong: '$createdAt' },
              { $mod: [{ $toLong: '$createdAt' }, interval] }
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: '$start',
        value: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        'timeframe.start': '$_id',
        'timeframe.end': {
          $toDate: {
            $add: [{ $toLong: '$_id' }, interval]
          }
        },
        value: 1
      }
    }
  ]

  const events = await Event.aggregate(aggregation).exec()

  // console.log(events)

  return { result: events }
}
