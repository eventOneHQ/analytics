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

export interface IQueryFilter {
  property_name: string
  operator: FilterOperator
  property_value: string
}

export type Interval = 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface IQuery {
  analysis_type: AnalysisType
  event_collection: string
  target_property?: string
  percentile?: number
  timeframe?: string | { start: string; end: string }
  timezone?: string
  interval?: Interval
  filters?: IQueryFilter[]
  group_by?: string
  limit?: number
}

export interface QueryResult {
  result: any
}
