import { IQueryFilter, FilterOperator } from '../types/query'

const OPERATORS: FilterOperator[] = [
  'eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'exists', 'in', 'contains', 'not_contains', 'regex'
]

interface Props {
  filters: IQueryFilter[]
  onChange: (filters: IQueryFilter[]) => void
  knownProperties?: string[]
}

export default function FilterEditor({ filters, onChange, knownProperties = [] }: Props) {
  const add = () => onChange([...filters, { property_name: '', operator: 'eq', property_value: '' }])
  const remove = (i: number) => onChange(filters.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof IQueryFilter, value: string) => {
    const next = [...filters]
    next[i] = { ...next[i], [field]: value }
    onChange(next)
  }

  const listId = 'filter-properties-list'

  return (
    <div>
      {knownProperties.length > 0 && (
        <datalist id={listId}>
          {knownProperties.map(p => <option key={p} value={p} />)}
        </datalist>
      )}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-gray-400">Filters</label>
        <button
          type="button"
          onClick={add}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          + Add filter
        </button>
      </div>
      <div className="space-y-2">
        {filters.map((f, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={f.property_name}
              onChange={e => update(i, 'property_name', e.target.value)}
              placeholder="property"
              list={knownProperties.length > 0 ? listId : undefined}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
            <select
              value={f.operator}
              onChange={e => update(i, 'operator', e.target.value as FilterOperator)}
              className="bg-gray-800 border border-gray-600 rounded-md px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            <input
              value={f.property_value}
              onChange={e => update(i, 'property_value', e.target.value)}
              placeholder="value"
              className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-gray-500 hover:text-red-400 transition-colors text-sm"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
