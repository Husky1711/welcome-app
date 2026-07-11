const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const JPEG_QUALITY = 0.85

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function validateImageFile(file: File): void {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new Error('Please choose a JPG, PNG, or WebP image.')
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image must be smaller than 5 MB.')
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read that image. Try another file.'))
    }

    image.src = objectUrl
  })
}

export async function processImageFile(file: File, maxDimension = 256): Promise<string> {
  validateImageFile(file)

  const image = await loadImageFromFile(file)
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Could not process that image.')
  }

  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}
