import { useCollections } from '../hooks/useCollections'

interface Props {
  projectId: string
  readKey: string
  value: string
  onChange: (name: string) => void
}

export default function CollectionPicker({ projectId, readKey, value, onChange }: Props) {
  const { collections, loading } = useCollections(projectId, readKey)

  if (loading) return <div className="text-gray-400 text-sm">Loading collections…</div>

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">Event Collection</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
      >
        <option value="">Select collection…</option>
        {collections.map(c => (
          <option key={c.name} value={c.name}>{c.name} ({c.eventCount} events)</option>
        ))}
      </select>
    </div>
  )
}
