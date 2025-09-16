import { useState } from 'react'

export interface FilterOption {
  id: string
  label: string
  category: 'language' | 'framework' | 'technology'
  color?: string
}

interface SearchFilterCardsProps {
  options?: FilterOption[]
  selectedFilters: string[]
  onFilterChange: (selectedIds: string[]) => void
  className?: string
}

const defaultOptions: FilterOption[] = [
  // Languages
  { id: 'javascript', label: 'JavaScript', category: 'language', color: 'bg-yellow-500' },
  { id: 'typescript', label: 'TypeScript', category: 'language', color: 'bg-blue-500' },
  { id: 'python', label: 'Python', category: 'language', color: 'bg-green-500' },
  { id: 'java', label: 'Java', category: 'language', color: 'bg-orange-500' },
  { id: 'csharp', label: 'C#', category: 'language', color: 'bg-purple-500' },
  { id: 'php', label: 'PHP', category: 'language', color: 'bg-indigo-500' },
  { id: 'ruby', label: 'Ruby', category: 'language', color: 'bg-red-500' },
  { id: 'go', label: 'Go', category: 'language', color: 'bg-cyan-500' },
  
  // Frontend Frameworks
  { id: 'react', label: 'React', category: 'framework', color: 'bg-blue-400' },
  { id: 'vue', label: 'Vue.js', category: 'framework', color: 'bg-green-400' },
  { id: 'angular', label: 'Angular', category: 'framework', color: 'bg-red-400' },
  { id: 'svelte', label: 'Svelte', category: 'framework', color: 'bg-orange-400' },
  { id: 'nextjs', label: 'Next.js', category: 'framework', color: 'bg-gray-700' },
  
  // Backend Frameworks
  { id: 'nodejs', label: 'Node.js', category: 'framework', color: 'bg-green-600' },
  { id: 'express', label: 'Express', category: 'framework', color: 'bg-gray-600' },
  { id: 'django', label: 'Django', category: 'framework', color: 'bg-green-700' },
  { id: 'flask', label: 'Flask', category: 'framework', color: 'bg-gray-500' },
  { id: 'spring', label: 'Spring', category: 'framework', color: 'bg-green-500' },
  { id: 'dotnet', label: '.NET', category: 'framework', color: 'bg-purple-600' },
  
  // Technologies
  { id: 'docker', label: 'Docker', category: 'technology', color: 'bg-blue-600' },
  { id: 'kubernetes', label: 'Kubernetes', category: 'technology', color: 'bg-blue-700' },
  { id: 'aws', label: 'AWS', category: 'technology', color: 'bg-orange-600' },
  { id: 'mongodb', label: 'MongoDB', category: 'technology', color: 'bg-green-600' },
  { id: 'postgresql', label: 'PostgreSQL', category: 'technology', color: 'bg-blue-800' },
]

export default function SearchFilterCards({ 
  options = defaultOptions, 
  selectedFilters, 
  onFilterChange,
  className = ''
}: SearchFilterCardsProps) {
  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(id => id !== filterId)
      : [...selectedFilters, filterId]
    
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    onFilterChange([])
  }

  const groupedOptions = options.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = []
    }
    acc[option.category].push(option)
    return acc
  }, {} as Record<string, FilterOption[]>)

  const categoryLabels = {
    language: 'Lenguajes',
    framework: 'Frameworks',
    technology: 'Tecnologías'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
        {selectedFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar filtros ({selectedFilters.length})
          </button>
        )}
      </div>

      {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </h4>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((option) => {
              const isSelected = selectedFilters.includes(option.id)
              return (
                <button
                  key={option.id}
                  onClick={() => toggleFilter(option.id)}
                  className={`
                    px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 
                    border-2 cursor-pointer select-none
                    ${isSelected 
                      ? `${option.color || 'bg-blue-500'} text-white border-transparent shadow-md transform scale-105`
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-sm'
                    }
                  `}
                >
                  {option.label}
                  {isSelected && (
                    <span className="ml-2 text-white">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selectedFilters.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Filtros activos:</span>
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedFilters.map((filterId) => {
              const option = options.find(opt => opt.id === filterId)
              if (!option) return null
              
              return (
                <span
                  key={filterId}
                  className={`px-2 py-1 rounded text-xs font-medium text-white ${option.color || 'bg-gray-500'}`}
                >
                  {option.label}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}