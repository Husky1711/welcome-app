import { describe, expect, it } from 'vitest'
import { clampCropOffset, computeMinCropScale } from './circularCrop'

describe('circularCrop', () => {
  it('computes a min scale that covers the viewport', () => {
    expect(computeMinCropScale(400, 200, 200)).toBe(1)
    expect(computeMinCropScale(100, 300, 200)).toBe(2)
  })

  it('clamps offsets so the image always covers the crop circle', () => {
    const result = clampCropOffset(200, -200, 1, 400, 400, 200)

    expect(result.offsetX).toBe(100)
    expect(result.offsetY).toBe(-100)
    expect(result.scale).toBe(1)
  })
})
