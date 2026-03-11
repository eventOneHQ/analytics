import { useState } from 'react'
import Layout from './components/Layout'
import ProjectSelector from './components/ProjectSelector'
import QueryBuilder from './components/QueryBuilder'
import ResultChart from './components/ResultChart'
import SettingsModal from './components/SettingsModal'
import { QueryResult } from './types/query'

export default function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedProjectReadKey, setSelectedProjectReadKey] = useState<string>('')
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [hasInterval, setHasInterval] = useState(false)
  const [hasGroupBy, setHasGroupBy] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  // Increment to force ProjectSelector to re-mount (re-fetch) after settings change
  const [projectListKey, setProjectListKey] = useState(0)

  const handleSettingsSaved = () => {
    setSettingsOpen(false)
    setSelectedProjectId('')
    setSelectedProjectReadKey('')
    setQueryResult(null)
    setProjectListKey(k => (k + 1) % 2)
  }

  return (
    <Layout onSettingsClick={() => setSettingsOpen(true)}>
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onSaved={handleSettingsSaved}
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <ProjectSelector
            key={projectListKey}
            onSelect={(id, readKey) => {
              setSelectedProjectId(id)
              setSelectedProjectReadKey(readKey)
              setQueryResult(null)
            }}
          />
          {selectedProjectId && (
            <QueryBuilder
              projectId={selectedProjectId}
              readKey={selectedProjectReadKey}
              onResult={(result, interval, groupBy) => {
                setQueryResult(result)
                setHasInterval(!!interval)
                setHasGroupBy(!!groupBy)
              }}
            />
          )}
        </div>
        <div className="lg:col-span-2">
          {queryResult && (
            <ResultChart
              result={queryResult}
              hasInterval={hasInterval}
              hasGroupBy={hasGroupBy}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
