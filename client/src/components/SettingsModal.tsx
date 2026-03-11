import { useState } from 'react'

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function SettingsModal({ onClose, onSaved }: Props) {
  const [rootKey, setRootKey] = useState(localStorage.getItem('rootKey') || '')

  const handleSave = () => {
    localStorage.setItem('rootKey', rootKey)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Root API Key</label>
            <input
              type="password"
              value={rootKey}
              onChange={e => setRootKey(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="your-root-key"
            />
            <p className="text-xs text-gray-500 mt-1">Used to load projects from the API.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
