import { useState, useEffect } from 'react'

interface Project {
  _id: string
  name: string
  readKey?: string
  masterKey?: string
  writeKey?: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const rootKey = localStorage.getItem('rootKey')
    if (!rootKey) {
      setError('No root key configured. Click Settings to add one.')
      return
    }

    setLoading(true)
    fetch('/1.0/projects', {
      headers: { 'X-Root-Key': rootKey }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setProjects(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { projects, loading, error }
}
