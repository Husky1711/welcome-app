import type { AppColor } from '../types/settings'

export interface AppColorOption {
  id: AppColor
  label: string
  swatches: readonly [string, string]
}

export const APP_COLOR_OPTIONS: readonly AppColorOption[] = [
  { id: 'forest', label: 'Forest', swatches: ['#1b4332', '#74c69d'] },
  { id: 'ocean', label: 'Ocean', swatches: ['#155e75', '#67c7dc'] },
  { id: 'plum', label: 'Plum', swatches: ['#6b3f69', '#c59bc2'] },
  { id: 'terracotta', label: 'Terracotta', swatches: ['#9a4f3d', '#e3a08f'] },
] as const

export const DEFAULT_APP_COLOR: AppColor = 'forest'

export function isAppColor(value: unknown): value is AppColor {
  return APP_COLOR_OPTIONS.some((option) => option.id === value)
}
