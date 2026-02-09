'use client'

import { useState } from 'react'
import { UPLOAD_CONFIG } from '../lib/upload-config'

type UploadProgress = {
  filename: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
}

export function useMultipartUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({})

  async function uploadFile(file: File, submissionId: string) {
    const fileId = `${file.name}-${Date.now()}`

    setUploads(prev => ({
      ...prev,
      [fileId]: { filename: file.name, progress: 0, status: 'pending' },
    }))

    try {
      const presignResponse = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, key, isMultipart, uploadId } = await presignResponse.json()

      setUploads(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'uploading' },
      }))

      if (isMultipart) {
        await uploadMultipart(file, key, uploadId, submissionId, fileId)
      } else {
        await uploadSingle(file, uploadUrl, key, submissionId, fileId)
      }

      setUploads(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], progress: 100, status: 'completed' },
      }))
    } catch (error) {
      console.error('Upload failed:', error)
      setUploads(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'failed' },
      }))
      throw error
    }
  }

  async function uploadSingle(
    file: File,
    uploadUrl: string,
    key: string,
    submissionId: string,
    fileId: string
  ) {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    setUploads(prev => ({
      ...prev,
      [fileId]: { ...prev[fileId], progress: 90 },
    }))

    await fetch('/api/uploads/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        submissionId,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    })
  }

  async function uploadMultipart(
    file: File,
    key: string,
    uploadId: string,
    submissionId: string,
    fileId: string
  ) {
    const chunkSize = UPLOAD_CONFIG.chunkSize
    const chunks = Math.ceil(file.size / chunkSize)
    const parts: Array<{ PartNumber: number; ETag: string }> = []

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const partNumber = i + 1
      const partUrl = `/api/uploads/part?uploadId=${uploadId}&key=${encodeURIComponent(key)}&partNumber=${partNumber}`

      const response = await fetch(partUrl, {
        method: 'PUT',
        body: chunk,
      })

      const etag = response.headers.get('ETag')
      if (etag) {
        parts.push({ PartNumber: partNumber, ETag: etag.replace(/"/g, '') })
      }

      setUploads(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          progress: Math.round(((i + 1) / chunks) * 90),
        },
      }))
    }

    await fetch('/api/uploads/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadId,
        key,
        parts,
        submissionId,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    })
  }

  return { uploads, uploadFile }
}
