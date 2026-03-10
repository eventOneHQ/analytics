import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onSettingsClick: () => void
}

export default function Layout({ children, onSettingsClick }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Analytics Explorer</h1>
        </div>
        <button
          onClick={onSettingsClick}
          className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-md border border-gray-700 hover:border-gray-500 transition-colors"
        >
          ⚙ Settings
        </button>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
