import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FilesAPI } from '../api/nlpvitae'

export interface SearchFilters {
  selectedTechnologies: string[]
  searchQuery: string
}

export interface SearchResult {
  id: string
  name: string
  technologies: string[]
  matchedTechnologies: string[]
  relevanceScore: number
  raw: any
}

// Función para extraer tecnologías del contenido de un CV
function extractTechnologiesFromContent(content: any): string[] {
  if (!content) return []
  
  const technologies = new Set<string>()
  const contentStr = JSON.stringify(content).toLowerCase()
  
  // Mapeo de tecnologías y sus variaciones
  const techPatterns = {
    javascript: ['javascript', 'js', 'node.js', 'nodejs'],
    typescript: ['typescript', 'ts'],
    python: ['python', 'django', 'flask', 'fastapi'],
    java: ['java', 'spring', 'spring boot', 'springboot'],
    csharp: ['c#', 'csharp', '.net', 'dotnet', 'asp.net'],
    php: ['php', 'laravel', 'symfony'],
    ruby: ['ruby', 'rails', 'ruby on rails'],
    go: ['golang', 'go'],
    react: ['react', 'reactjs', 'react.js'],
    vue: ['vue', 'vuejs', 'vue.js'],
    angular: ['angular', 'angularjs'],
    svelte: ['svelte', 'sveltekit'],
    nextjs: ['next.js', 'nextjs', 'next'],
    nodejs: ['node.js', 'nodejs', 'node'],
    express: ['express', 'expressjs', 'express.js'],
    django: ['django'],
    flask: ['flask'],
    spring: ['spring', 'spring boot', 'springboot'],
    dotnet: ['.net', 'dotnet', 'asp.net'],
    docker: ['docker', 'containerization'],
    kubernetes: ['kubernetes', 'k8s'],
    aws: ['aws', 'amazon web services'],
    mongodb: ['mongodb', 'mongo'],
    postgresql: ['postgresql', 'postgres'],
  }
  
  // Buscar patrones en el contenido
  Object.entries(techPatterns).forEach(([tech, patterns]) => {
    patterns.forEach(pattern => {
      if (contentStr.includes(pattern)) {
        technologies.add(tech)
      }
    })
  })
  
  return Array.from(technologies)
}

// Función para calcular la relevancia de un resultado
function calculateRelevanceScore(
  extractedTechnologies: string[],
  selectedFilters: string[],
  searchQuery: string,
  fileName: string
): number {
  let score = 0
  
  // Puntos por tecnologías coincidentes
  const matchedTechs = extractedTechnologies.filter(tech => 
    selectedFilters.includes(tech)
  )
  score += matchedTechs.length * 10
  
  // Puntos por búsqueda textual en nombre de archivo
  if (searchQuery && fileName.toLowerCase().includes(searchQuery.toLowerCase())) {
    score += 20
  }
  
  // Bonus por mayor número de tecnologías coincidentes
  if (matchedTechs.length === selectedFilters.length && selectedFilters.length > 0) {
    score += 30 // Bonus por coincidencia completa
  }
  
  return score
}

export function useSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    selectedTechnologies: [],
    searchQuery: ''
  })
  
  // Obtener todos los archivos
  const { data: filesData, isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: FilesAPI.getAll
  })
  
  // Procesar y filtrar resultados
  const searchResults = useMemo(() => {
    if (!filesData || isLoading) return []
    
    // Extraer la lista de archivos del response
    let files: any[] = []
    if (Array.isArray(filesData)) {
      files = filesData
    } else if (filesData && typeof filesData === 'object') {
      // Buscar en propiedades comunes
      const possibleKeys = ['files', 'data', 'items', 'results', 'documents']
      for (const key of possibleKeys) {
        if (Array.isArray((filesData as any)[key])) {
          files = (filesData as any)[key]
          break
        }
      }
      // Si no encuentra arrays, usar Object.values
      if (files.length === 0) {
        const values = Object.values(filesData)
        if (values.length && values.every(v => v && typeof v === 'object')) {
          files = values
        }
      }
    }
    
    const results: SearchResult[] = files.map((file: any) => {
      const fileName = file.name || file.filename || file.file_name || 'Archivo sin nombre'
      const fileId = file.file_id || file._id || file.id || Math.random().toString()
      
      // Extraer contenido NER si existe
      let content = null
      if (Array.isArray(file.results)) {
        const nerResult = file.results.find((r: any) => r?.process === 'NER')
        content = nerResult?.data || file.results[0]?.data
      }
      
      const extractedTechnologies = extractTechnologiesFromContent(content)
      const matchedTechnologies = extractedTechnologies.filter(tech => 
        filters.selectedTechnologies.includes(tech)
      )
      
      const relevanceScore = calculateRelevanceScore(
        extractedTechnologies,
        filters.selectedTechnologies,
        filters.searchQuery,
        fileName
      )
      
      return {
        id: fileId,
        name: fileName,
        technologies: extractedTechnologies,
        matchedTechnologies,
        relevanceScore,
        raw: file
      }
    })
    
    // Aplicar filtros
    let filteredResults = results
    
    // Filtrar por tecnologías seleccionadas
    if (filters.selectedTechnologies.length > 0) {
      filteredResults = filteredResults.filter(result => 
        result.matchedTechnologies.length > 0
      )
    }
    
    // Filtrar por búsqueda textual
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      filteredResults = filteredResults.filter(result =>
        result.name.toLowerCase().includes(query)
      )
    }
    
    // Ordenar por relevancia
    return filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }, [filesData, filters, isLoading])
  
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }
  
  const setSelectedTechnologies = (technologies: string[]) => {
    updateFilters({ selectedTechnologies: technologies })
  }
  
  const setSearchQuery = (query: string) => {
    updateFilters({ searchQuery: query })
  }
  
  const clearFilters = () => {
    setFilters({
      selectedTechnologies: [],
      searchQuery: ''
    })
  }
  
  return {
    filters,
    searchResults,
    isLoading,
    setSelectedTechnologies,
    setSearchQuery,
    updateFilters,
    clearFilters,
    hasActiveFilters: filters.selectedTechnologies.length > 0 || filters.searchQuery.trim() !== ''
  }
}