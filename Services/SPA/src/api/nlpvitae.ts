import { api } from './client'
export type AnyJson = unknown

export const FilesAPI = {
  getAll: () => api.get<AnyJson>('/file/all'),
  getById: (file_id: string) => api.get<AnyJson>(`/file/filter/id/${encodeURIComponent(file_id)}`),
  getByDate: (creation_date: string) => api.get<AnyJson>(`/file/filter/date/${encodeURIComponent(creation_date)}`),
}

export const HealthAPI = { check: () => api.get<AnyJson>('/health') }

export const UploadAPI = {
  uploadPdf: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.postForm<AnyJson>('/upload', fd)
  },
}

export const DownloadAPI = {
  url: (file_id: string) => {
    const base = (window as any).BASE_URL_OVERRIDE || (import.meta as any).env.VITE_API_BASE_URL
    return `${base}/download/${encodeURIComponent(file_id)}`
  }
}