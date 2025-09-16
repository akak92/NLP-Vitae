import { useState } from 'react'
import SearchFilterCards from '../components/SearchFilterCards'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'
import Modal from '../components/Modal'
import ExtractedView from '../components/ExtractedView'
import { useSearch, SearchResult } from '../hooks/useSearch'
import { PictureAPI } from '../api/nlpvitae'

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
          Búsqueda de CVs
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
        <Modal open={true} onClose={closeModal} title={`CV: ${selectedResult.name}`}>
          <div className="space-y-6">
            {/* Header with relevance info */}
            <div className="card border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Información del candidato</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Puntuación de relevancia</div>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < Math.min(5, Math.floor(selectedResult.relevanceScore / 20))
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        {selectedResult.relevanceScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies Match Summary */}
              {selectedResult.technologies.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Tecnologías detectadas ({selectedResult.technologies.length})
                    {selectedResult.matchedTechnologies.length > 0 && (
                      <span className="text-green-600 ml-1">
                        • {selectedResult.matchedTechnologies.length} coincidencias
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.technologies.map((tech) => {
                      const isMatched = selectedResult.matchedTechnologies.includes(tech)
                      return (
                        <span
                          key={tech}
                          className={`badge ${
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
              )}
            </div>

            {/* CV Content using ExtractedView format */}
            <div className="border-t border-gray-200 pt-6">
              <ExtractedView 
                value={(() => {
                  // Extraer solo los datos del NER para mostrar de forma estructurada
                  if (Array.isArray(selectedResult.raw.results)) {
                    const nerResult = selectedResult.raw.results.find((r: any) => r?.process === 'NER')
                    if (nerResult?.data) {
                      return nerResult.data
                    }
                    // Si no hay NER, usar OCR como fallback
                    const ocrResult = selectedResult.raw.results.find((r: any) => r?.process === 'Docling' || r?.process === 'OCR')
                    if (ocrResult?.data) {
                      return ocrResult.data
                    }
                  }
                  // Fallback si no hay structure de results
                  return selectedResult.raw
                })()}
                pictureUrl={(() => {
                  // Obtener picture_id desde los resultados del CV
                  let pictureId = null
                  if (Array.isArray(selectedResult.raw.results)) {
                    const cvResult = selectedResult.raw.results.find((r: any) => r?.process === 'CV')
                    if (cvResult?.data && typeof cvResult.data === 'string' && cvResult.data.includes('_id:')) {
                      // Extraer el picture_id del string "Profile pictured extracted with _id: ..."
                      const match = cvResult.data.match(/_id:\s*([a-f0-9]+)/)
                      if (match) {
                        pictureId = match[1]
                      }
                    }
                  }
                  // También verificar si existe picture_id directamente en el objeto
                  if (!pictureId && selectedResult.raw.picture_id) {
                    pictureId = selectedResult.raw.picture_id
                  }
                  return pictureId ? PictureAPI.byId(pictureId) : undefined
                })()}
              />
            </div>
            
            {/* Additional metadata at bottom */}
            <div className="border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span>Archivo: {selectedResult.name}</span>
                  <span>Análisis completado</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}