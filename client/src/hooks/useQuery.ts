import { useState } from 'react'
import { IQuery, QueryResult } from '../types/query'

export function useQuery(projectId: string, readKey: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runQuery = async (query: IQuery): Promise<QueryResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/1.0/projects/${projectId}/queries/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': readKey
        },
        body: JSON.stringify(query)
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `HTTP ${res.status}`)
      }

      return await res.json()
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { runQuery, loading, error }
}
