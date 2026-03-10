export type AnalysisType =
  | 'count'
  | 'count_unique'
  | 'sum'
  | 'average'
  | 'minimum'
  | 'maximum'
  | 'median'
  | 'percentile'
  | 'select_unique'
  | 'extraction'

export type FilterOperator =
  | 'eq' | 'ne'
  | 'lt' | 'lte'
  | 'gt' | 'gte'
  | 'exists'
  | 'in'
  | 'contains' | 'not_contains'
  | 'regex'
  | 'or'

// Keep backward-compat enum for analysis.ts
export enum FilterOperators {
  or = 'or',
  eq = 'eq',
  ne = 'ne',
  lt = 'lt',
  lte = 'lte',
  gt = 'gt',
  gte = 'gte',
  exists = 'exists',
  in = 'in',
  contains = 'contains',
  not_contains = 'not_contains',
  regex = 'regex'
}

export interface IQueryFilter {
  property_name: string
  operator: FilterOperator
  property_value: unknown
}

export interface IQueryOrFilter {
  operator: 'or'
  operands: QueryFilter[]
}

export type QueryFilter = IQueryFilter | IQueryOrFilter

export type AbsoluteTimeframe = { start: string; end: string }
export type RelativeTimeframe = string
export type Timeframe = AbsoluteTimeframe | RelativeTimeframe

export type Interval = 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface IQueryOrderBy {
  property_name: string
  direction?: 'ASC' | 'DESC'
}

export interface IQuery {
  analysis_type: AnalysisType
  event_collection: string
  target_property?: string
  percentile?: number
  timeframe?: Timeframe
  timezone?: string
  interval?: Interval
  filters?: QueryFilter[]
  group_by?: string | string[]
  order_by?: IQueryOrderBy
  limit?: number
}
