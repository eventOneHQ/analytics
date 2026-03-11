import { useState } from 'react'
import CollectionPicker from './CollectionPicker'
import FilterEditor from './FilterEditor'
import { IQuery, IQueryFilter, AnalysisType, Interval } from '../types/query'
import { useQuery } from '../hooks/useQuery'
import { useCollections } from '../hooks/useCollections'

const ANALYSIS_TYPES: AnalysisType[] = [
  'count', 'count_unique', 'sum', 'average', 'minimum', 'maximum',
  'median', 'percentile', 'select_unique', 'extraction'
]

const INTERVALS: Interval[] = ['minutely', 'hourly', 'daily', 'weekly', 'monthly', 'yearly']

const TIMEFRAMES = [
  'today', 'yesterday', 'this_week', 'this_month', 'this_year',
  'this_7_days', 'this_14_days', 'this_30_days',
  'last_7_days', 'last_14_days', 'last_30_days', 'last_60_days', 'last_90_days'
]

interface Props {
  projectId: string
  readKey: string
  onResult: (result: any, interval?: string, groupBy?: string) => void
}

export default function QueryBuilder({ projectId, readKey, onResult }: Props) {
  const [collection, setCollection] = useState('')
  const [analysisType, setAnalysisType] = useState<AnalysisType>('count')
  const [targetProperty, setTargetProperty] = useState('')
  const [timeframe, setTimeframe] = useState('this_14_days')
  const [interval, setInterval] = useState<Interval | ''>('')
  const [groupBy, setGroupBy] = useState('')
  const [limit, setLimit] = useState('')
  const [filters, setFilters] = useState<IQueryFilter[]>([])
  const { runQuery, loading, error } = useQuery(projectId, readKey)
  const { collections } = useCollections(projectId, readKey)

  // Get known properties for the currently selected collection
  const selectedCollection = collections.find(c => c.name === collection)
  const knownProperties = selectedCollection ? Object.keys(selectedCollection.properties) : []

  const handleCollectionChange = (name: string) => {
    setCollection(name)
    setFilters([])
    setTargetProperty('')
    setGroupBy('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collection) return

    const query: IQuery = {
      analysis_type: analysisType,
      event_collection: collection,
      timeframe: timeframe || undefined,
      filters: filters.filter(f => f.property_name),
    }
    if (targetProperty) query.target_property = targetProperty
    if (interval) query.interval = interval
    if (groupBy) query.group_by = groupBy
    if (limit) query.limit = parseInt(limit, 10)

    const result = await runQuery(query)
    if (result) {
      onResult(result, interval || undefined, groupBy || undefined)
    }
  }

  const needsTarget = ['count_unique', 'sum', 'average', 'minimum', 'maximum', 'median', 'percentile', 'select_unique'].includes(analysisType)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Query Builder</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CollectionPicker
          projectId={projectId}
          readKey={readKey}
          value={collection}
          onChange={handleCollectionChange}
        />

        <div>
          <label className="block text-sm text-gray-400 mb-1">Analysis Type</label>
          <select
            value={analysisType}
            onChange={e => setAnalysisType(e.target.value as AnalysisType)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {ANALYSIS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {needsTarget && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Property</label>
            <input
              value={targetProperty}
              onChange={e => setTargetProperty(e.target.value)}
              placeholder="e.g. revenue"
              list={knownProperties.length > 0 ? 'target-properties-list' : undefined}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
            {knownProperties.length > 0 && (
              <datalist id="target-properties-list">
                {knownProperties.map(p => <option key={p} value={p} />)}
              </datalist>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-1">Timeframe</label>
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">No timeframe</option>
            {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Interval (optional)</label>
          <select
            value={interval}
            onChange={e => setInterval(e.target.value as Interval | '')}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">No interval</option>
            {INTERVALS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Group By (optional)</label>
          <input
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
            placeholder="e.g. country"
            list={knownProperties.length > 0 ? 'group-by-properties-list' : undefined}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
          {knownProperties.length > 0 && (
            <datalist id="group-by-properties-list">
              {knownProperties.map(p => <option key={p} value={p} />)}
            </datalist>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Limit (optional)</label>
          <input
            type="number"
            value={limit}
            onChange={e => setLimit(e.target.value)}
            placeholder="e.g. 100"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <FilterEditor filters={filters} onChange={setFilters} knownProperties={knownProperties} />

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!collection || loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {loading ? 'Running…' : 'Run Query'}
        </button>
      </form>
    </div>
  )
}
