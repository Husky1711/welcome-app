import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import type { NoteMediaMeta } from '../types/note'

export const NOTE_MEDIA_LIMITS = {
  maxImageBytes: 5 * 1024 * 1024,
  maxAttachmentBytes: 10 * 1024 * 1024,
  maxMediaPerNote: 8,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
} as const

export class NoteMediaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NoteMediaError'
  }
}

function notesMediaRoot(ownerKey: string, noteId: string): string {
  return `notes-media/${ownerKey}/${noteId}`
}

function extensionForMime(mimeType: string, fileName: string): string {
  const fromName = fileName.includes('.') ? fileName.split('.').pop() : ''
  if (fromName) return fromName.toLowerCase()
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  if (mimeType === 'image/gif') return 'gif'
  if (mimeType === 'image/jpeg') return 'jpg'
  return 'bin'
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 0x8000
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk))
  }
  return btoa(binary)
}

export async function saveNoteMediaFile(options: {
  ownerKey: string
  noteId: string
  file: File
  kind: 'image' | 'attachment'
}): Promise<NoteMediaMeta> {
  const { ownerKey, noteId, file, kind } = options
  const maxBytes =
    kind === 'image' ? NOTE_MEDIA_LIMITS.maxImageBytes : NOTE_MEDIA_LIMITS.maxAttachmentBytes

  if (file.size <= 0) {
    throw new NoteMediaError('That file is empty.')
  }
  if (file.size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024))
    throw new NoteMediaError(
      kind === 'image'
        ? `Images must be ${limitMb} MB or smaller.`
        : `Attachments must be ${limitMb} MB or smaller.`,
    )
  }
  if (kind === 'image' && !NOTE_MEDIA_LIMITS.allowedImageTypes.includes(file.type as typeof NOTE_MEDIA_LIMITS.allowedImageTypes[number])) {
    throw new NoteMediaError('Use a JPG, PNG, WEBP, or GIF image.')
  }

  const fileId = crypto.randomUUID()
  const extension = extensionForMime(file.type || 'application/octet-stream', file.name)
  const relativePath = `${notesMediaRoot(ownerKey, noteId)}/${fileId}.${extension}`
  const data = await blobToBase64(file)

  await Filesystem.writeFile({
    path: relativePath,
    data,
    directory: Directory.Data,
    recursive: true,
  })

  return {
    fileId,
    fileName: file.name || `file.${extension}`,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    relativePath,
  }
}

export async function readNoteMediaDataUrl(relativePath: string): Promise<string> {
  const result = await Filesystem.readFile({
    path: relativePath,
    directory: Directory.Data,
  })
  const data = typeof result.data === 'string' ? result.data : ''
  const mimeGuess = relativePath.endsWith('.png')
    ? 'image/png'
    : relativePath.endsWith('.webp')
      ? 'image/webp'
      : relativePath.endsWith('.gif')
        ? 'image/gif'
        : 'image/jpeg'
  return `data:${mimeGuess};base64,${data}`
}

export async function deleteNoteMediaFile(relativePath: string): Promise<void> {
  try {
    await Filesystem.deleteFile({
      path: relativePath,
      directory: Directory.Data,
    })
  } catch {
    // Missing files are fine during cleanup.
  }
}

export async function deleteAllNoteMedia(ownerKey: string, noteId: string): Promise<void> {
  try {
    await Filesystem.rmdir({
      path: notesMediaRoot(ownerKey, noteId),
      directory: Directory.Data,
      recursive: true,
    })
  } catch {
    // Directory may not exist.
  }
}

export function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isNativeMediaSupported(): boolean {
  return Capacitor.isNativePlatform() || typeof window !== 'undefined'
}
