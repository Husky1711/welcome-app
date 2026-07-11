export const CROP_VIEWPORT_SIZE = 280

export interface CropTransform {
  offsetX: number
  offsetY: number
  scale: number
}

export function computeMinCropScale(
  imageWidth: number,
  imageHeight: number,
  viewportSize = CROP_VIEWPORT_SIZE,
): number {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return 1
  }

  return Math.max(viewportSize / imageWidth, viewportSize / imageHeight)
}

export function clampCropOffset(
  offsetX: number,
  offsetY: number,
  scale: number,
  imageWidth: number,
  imageHeight: number,
  viewportSize = CROP_VIEWPORT_SIZE,
): CropTransform {
  const scaledWidth = imageWidth * scale
  const scaledHeight = imageHeight * scale
  const maxOffsetX = Math.max(0, (scaledWidth - viewportSize) / 2)
  const maxOffsetY = Math.max(0, (scaledHeight - viewportSize) / 2)

  return {
    offsetX: Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX)),
    offsetY: Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY)),
    scale,
  }
}

export function renderCircularCrop(
  image: HTMLImageElement,
  transform: CropTransform,
  outputSize: number,
  viewportSize = CROP_VIEWPORT_SIZE,
  quality = 0.85,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Could not process that image.')
  }

  context.beginPath()
  context.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
  context.closePath()
  context.clip()

  const ratio = outputSize / viewportSize
  const drawWidth = image.naturalWidth * transform.scale * ratio
  const drawHeight = image.naturalHeight * transform.scale * ratio
  const drawX = outputSize / 2 + transform.offsetX * ratio - drawWidth / 2
  const drawY = outputSize / 2 + transform.offsetY * ratio - drawHeight / 2

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight)
  return canvas.toDataURL('image/jpeg', quality)
}
