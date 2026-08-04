export type ThemeMode = 'light' | 'dark'
export type AppColor = 'forest' | 'ocean' | 'plum' | 'terracotta'

export interface AppSettings {
  theme: ThemeMode
  appColor: AppColor
  /** Show the sprout companion that strolls along the bottom nav. */
  companionEnabled: boolean
}
