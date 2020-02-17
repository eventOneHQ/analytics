export interface IQuery {
  event_collection: string
  timeframe: string
  target_property?: string

  filters?: QueryFilter[]
  timezone?: number
  group_by?: string
  order_by?: string | IQueryOrderBy
  interval?: string
}

export interface IQueryOrderBy {
  direction: string
  property_name: string
}

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
  not_contains = 'not_contains'
  // within = 'within',
  // regex = 'regex'
}

export type QueryFilter = IQueryFilter | IQueryOrFilter

export interface IQueryFilter {
  operator: FilterOperators
  property_name: string
  property_value?: string | number | boolean
}

export interface IQueryOrFilter {
  operator: FilterOperators
  operands: QueryFilter[]
}
