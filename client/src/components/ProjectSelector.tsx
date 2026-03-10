import { useProjects } from '../hooks/useProjects'

interface Props {
  onSelect: (id: string, readKey: string) => void
}

export default function ProjectSelector({ onSelect }: Props) {
  const { projects, loading, error } = useProjects()

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading projects…</div>
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
        {error}
      </div>
    )
  }

  if (!projects.length) {
    return <div className="text-gray-500 text-sm">No projects found. Create one first.</div>
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Project</h2>
      <select
        defaultValue=""
        onChange={e => {
          const project = projects.find(p => p._id === e.target.value)
          if (project) onSelect(project._id, project.readKey || project.masterKey || '')
        }}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
      >
        <option value="" disabled>Select a project…</option>
        {projects.map(p => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>
    </div>
  )
}
