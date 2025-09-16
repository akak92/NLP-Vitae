import { useState } from 'react'
import SearchFilterCards from '../components/SearchFilterCards'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'
import Modal from '../components/Modal'
import ExtractedView from '../components/ExtractedView'
import { useSearch, SearchResult } from '../hooks/useSearch'

export default function Search() {
  const {
    filters,
    searchResults,
    isLoading,
    setSelectedTechnologies,
    setSearchQuery,
    clearFilters,
    hasActiveFilters
  } = useSearch()

  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result)
  }

  const closeModal = () => {
    setSelectedResult(null)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Búsqueda de CVs por Tecnologías
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Encuentra candidatos perfectos para tu proyecto seleccionando las tecnologías que necesitas
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={filters.searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar por nombre de archivo..."
        className="max-w-2xl mx-auto"
      />

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <SearchFilterCards
              selectedFilters={filters.selectedTechnologies}
              onFilterChange={setSelectedTechnologies}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            />
            
            {hasActiveFilters && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Filtros activos</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {filters.selectedTechnologies.length} tecnologías seleccionadas
                      {filters.searchQuery && ', búsqueda textual activa'}
                    </p>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Limpiar todo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          <SearchResults
            results={searchResults}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onResultClick={handleResultClick}
          />
        </div>
      </div>

      {/* Modal for CV Details */}
      {selectedResult && (
        <Modal open={true} onClose={closeModal} title={selectedResult.name}>
          <div className="space-y-6">
            {/* CV Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Resumen del CV</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Archivo:</span>
                  <p className="text-gray-900">{selectedResult.name}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Puntuación de relevancia:</span>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.min(5, Math.floor(selectedResult.relevanceScore / 20))
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({selectedResult.relevanceScore} puntos)
                    </span>
                  </div>
                </div>
              </div>

              {/* Technologies Summary */}
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-600">Tecnologías detectadas:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedResult.technologies.map((tech) => {
                    const isMatched = selectedResult.matchedTechnologies.includes(tech)
                    return (
                      <span
                        key={tech}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isMatched
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {tech}
                        {isMatched && ' ✓'}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Extracted Content */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contenido extraído</h3>
              <ExtractedView value={selectedResult.raw} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}