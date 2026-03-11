import { useState, useEffect } from 'react'

interface Collection {
  name: string
  eventCount: number
  properties: Record<string, string>
}

export function useCollections(projectId: string, readKey: string) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId || !readKey) return

    setLoading(true)
    fetch(`/1.0/projects/${projectId}/collections`, {
      headers: { 'Authorization': readKey }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setCollections(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [projectId, readKey])

  return { collections, loading, error }
}
