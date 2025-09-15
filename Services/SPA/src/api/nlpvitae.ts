import { api } from './client'
import { useSettings } from '../state/settings'
export type AnyJson = unknown

function base() {
  return useSettings.getState().baseUrl
}

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
  url: (file_id: string) => `${base()}/download/${encodeURIComponent(file_id)}`
}

export const PictureAPI = {
  byFile: (file_id: string) => `${base()}/file/picture/by-file/${encodeURIComponent(file_id)}`,
  byId:   (picture_id: string) => `${base()}/file/picture/${encodeURIComponent(picture_id)}`
}