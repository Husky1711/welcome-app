import { useCallback, useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  CROP_VIEWPORT_SIZE,
  clampCropOffset,
  computeMinCropScale,
  renderCircularCrop,
  type CropTransform,
} from '../../utils/circularCrop'
import '../../styles/circular-image-cropper.css'

interface CircularImageCropperProps {
  open: boolean
  imageSrc: string
  title?: string
  hint?: string
  outputSize?: number
  confirmLabel?: string
  onApply: (dataUrl: string) => void
  onCancel: () => void
}

const MAX_ZOOM_FACTOR = 3

export function CircularImageCropper({
  open,
  imageSrc,
  title = 'Adjust your photo',
  hint = 'Drag to reposition. Pinch or use the slider to zoom.',
  outputSize = 256,
  confirmLabel = 'Use photo',
  onApply,
  onCancel,
}: CircularImageCropperProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragStateRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  } | null>(null)

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [minScale, setMinScale] = useState(1)
  const [transform, setTransform] = useState<CropTransform>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  })

  useEffect(() => {
    if (!open || !imageSrc) {
      return
    }

    const nextImage = new Image()
    nextImage.onload = () => {
      const nextMinScale = computeMinCropScale(
        nextImage.naturalWidth,
        nextImage.naturalHeight,
        CROP_VIEWPORT_SIZE,
      )

      imageRef.current = nextImage
      setImage(nextImage)
      setMinScale(nextMinScale)
      setTransform({ offsetX: 0, offsetY: 0, scale: nextMinScale })
    }
    nextImage.onerror = () => {
      onCancel()
    }
    nextImage.src = imageSrc

    return () => {
      imageRef.current = null
      setImage(null)
    }
  }, [open, imageSrc, onCancel])

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  const updateTransform = useCallback(
    (nextOffsetX: number, nextOffsetY: number, nextScale: number) => {
      if (!image) {
        return
      }

      const clampedScale = Math.min(
        minScale * MAX_ZOOM_FACTOR,
        Math.max(minScale, nextScale),
      )
      const clamped = clampCropOffset(
        nextOffsetX,
        nextOffsetY,
        clampedScale,
        image.naturalWidth,
        image.naturalHeight,
        CROP_VIEWPORT_SIZE,
      )
      setTransform(clamped)
    },
    [image, minScale],
  )

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!image || event.button !== 0) {
      return
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: transform.offsetX,
      offsetY: transform.offsetY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY
    updateTransform(
      dragState.offsetX + deltaX,
      dragState.offsetY + deltaY,
      transform.scale,
    )
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    dragStateRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!image) {
      return
    }

    event.preventDefault()
    const zoomDelta = event.deltaY > 0 ? -0.06 : 0.06
    updateTransform(transform.offsetX, transform.offsetY, transform.scale * (1 + zoomDelta))
  }

  function handleApply() {
    if (!image) {
      return
    }

    onApply(renderCircularCrop(image, transform, outputSize, CROP_VIEWPORT_SIZE))
  }

  if (!open) {
    return null
  }

  return createPortal(
    <div className="image-cropper" role="presentation" onClick={onCancel}>
      <div
        className="image-cropper__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-cropper-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="image-cropper-title" className="image-cropper__title">
          {title}
        </h2>
        <p className="image-cropper__hint">{hint}</p>

        <div
          className="image-cropper__viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          {image ? (
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              className="image-cropper__image"
              style={{
                width: `${image.naturalWidth}px`,
                height: `${image.naturalHeight}px`,
                transform: `translate(calc(-50% + ${transform.offsetX}px), calc(-50% + ${transform.offsetY}px)) scale(${transform.scale})`,
              }}
            />
          ) : (
            <div className="image-cropper__loading" aria-hidden="true" />
          )}
        </div>

        <label className="image-cropper__zoom-label" htmlFor="image-cropper-zoom">
          Zoom
        </label>
        <input
          id="image-cropper-zoom"
          type="range"
          min={minScale}
          max={minScale * MAX_ZOOM_FACTOR}
          step={minScale * 0.02}
          value={transform.scale}
          disabled={!image}
          className="image-cropper__zoom"
          onChange={(event) => {
            updateTransform(
              transform.offsetX,
              transform.offsetY,
              Number(event.target.value),
            )
          }}
        />

        <div className="image-cropper__actions">
          <button type="button" className="image-cropper__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="image-cropper__apply"
            onClick={handleApply}
            disabled={!image}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
