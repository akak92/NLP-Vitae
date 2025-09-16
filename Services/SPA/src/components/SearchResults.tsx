import { SearchResult } from '../hooks/useSearch'
import Avatar from './Atavar'
import { PictureAPI } from '../api/nlpvitae'

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  hasActiveFilters: boolean
  onResultClick?: (result: SearchResult) => void
}

export default function SearchResults({ 
  results, 
  isLoading, 
  hasActiveFilters,
  onResultClick 
}: SearchResultsProps) {
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-6 h-32"></div>
        ))}
      </div>
    )
  }

  if (!hasActiveFilters) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium mb-2">Comienza tu búsqueda</h3>
        <p>Selecciona tecnologías o escribe una palabra clave para encontrar CVs</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
        <p>Intenta ajustar tus filtros o términos de búsqueda</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Resultados de búsqueda
        </h2>
        <span className="text-sm text-gray-500">
          {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </span>
      </div>

      <div className="grid gap-6">
        {results.map((result) => {
          // Obtener picture_id desde los resultados del CV
          let pictureId = null
          if (Array.isArray(result.raw.results)) {
            const cvResult = result.raw.results.find((r: any) => r?.process === 'CV')
            if (cvResult?.data && typeof cvResult.data === 'string' && cvResult.data.includes('_id:')) {
              // Extraer el picture_id del string "Profile pictured extracted with _id: ..."
              const match = cvResult.data.match(/_id:\s*([a-f0-9]+)/)
              if (match) {
                pictureId = match[1]
              }
            }
          }
          // También verificar si existe picture_id directamente en el objeto
          if (!pictureId && result.raw.picture_id) {
            pictureId = result.raw.picture_id
          }

          return (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => onResultClick?.(result)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {pictureId ? (
                    <div className="relative">
                      <img
                        src={PictureAPI.byId(pictureId)}
                        alt={`Foto de perfil de ${result.name}`}
                        className="w-12 h-12 rounded-full object-cover bg-gray-200 border-2 border-gray-300"
                        onError={(e) => {
                          // Fallback al avatar por defecto si la imagen falla
                          const target = e.currentTarget as HTMLImageElement
                          const container = target.parentElement
                          if (container) {
                            container.innerHTML = ''
                            const avatarDiv = document.createElement('div')
                            container.appendChild(avatarDiv)
                            // Aquí insertaríamos el Avatar component, pero por simplicidad usamos initials
                            const initials = result.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            avatarDiv.className = 'w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm'
                            avatarDiv.textContent = initials
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <Avatar name={result.name} size={48} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {result.name}
                      </h3>
                      
                      {result.relevanceScore > 0 && (
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <span>Relevancia: </span>
                          <div className="flex ml-2">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${
                                  i < Math.min(5, Math.floor(result.relevanceScore / 20))
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver detalles →
                    </button>
                  </div>

                  {/* Tecnologías coincidentes */}
                  {result.matchedTechnologies.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-green-700">
                        Tecnologías coincidentes:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.matchedTechnologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Todas las tecnologías encontradas */}
                  {result.technologies.length > result.matchedTechnologies.length && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-600">
                        Otras tecnologías:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.technologies
                          .filter(tech => !result.matchedTechnologies.includes(tech))
                          .slice(0, 8) // Limitar para no saturar la UI
                          .map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        {result.technologies.length - result.matchedTechnologies.length > 8 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                            +{result.technologies.length - result.matchedTechnologies.length - 8} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Información adicional */}
                  {result.raw.creation_date && (
                    <div className="mt-3 text-sm text-gray-500">
                      <span>Fecha de carga: </span>
                      <span>
                        {new Date(result.raw.creation_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}