import { processImageFile, validateImageFile } from './imageUpload'

export { validateImageFile as validateAvatarFile }

export async function processAvatarFile(file: File): Promise<string> {
  return processImageFile(file, 256)
}
