import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'
import { QueryResult } from '../types/query'

interface Props {
  result: QueryResult
  hasInterval: boolean
  hasGroupBy: boolean
}

export default function ResultChart({ result, hasInterval, hasGroupBy }: Props) {
  const data = result.result

  // Scalar result
  if (typeof data === 'number' || (typeof data === 'object' && !Array.isArray(data))) {
    const val = typeof data === 'number' ? data : JSON.stringify(data)
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-48">
        <div className="text-6xl font-bold text-white tabular-nums">{val}</div>
        <div className="text-gray-500 text-sm mt-2">Result</div>
      </div>
    )
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 flex items-center justify-center min-h-48">
        <div className="text-gray-500">No results</div>
      </div>
    )
  }

  // Array of raw events (extraction)
  if (data[0] && !('result' in data[0]) && !('timeframe' in data[0])) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Extraction Results ({data.length} events)</h3>
        <div className="overflow-auto max-h-96">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  // Time series (interval)
  if (hasInterval && data[0]?.timeframe) {
    const chartData = data.map((d: any) => ({
      time: new Date(d.timeframe.start).toLocaleDateString(),
      value: d.result ?? 0
    }))

    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Time Series</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#E5E7EB' }}
              itemStyle={{ color: '#818CF8' }}
            />
            <Line type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Group-by bar chart
  if (hasGroupBy) {
    const firstKey = Object.keys(data[0]).find(k => k !== 'result')
    const chartData = data.map((d: any) => ({
      name: String(d[firstKey || 'group'] ?? 'Unknown'),
      value: d.result ?? 0
    }))

    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Group By Results</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#E5E7EB' }}
              itemStyle={{ color: '#818CF8' }}
            />
            <Bar dataKey="value" fill="#818CF8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Fallback: JSON display
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Result</h3>
      <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
