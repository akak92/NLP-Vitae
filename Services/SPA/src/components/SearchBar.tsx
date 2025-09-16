import { useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Buscar por nombre de archivo...",
  className = ""
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative flex items-center border-2 rounded-lg transition-all duration-200
        ${isFocused 
          ? 'border-blue-500 shadow-lg' 
          : 'border-gray-300 hover:border-gray-400'
        }
      `}>
        <div className="absolute left-3 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
        />
        
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Puedes buscar por nombre de archivo o combinar con los filtros de tecnología
          </p>
        </div>
      )}
    </div>
  )
}