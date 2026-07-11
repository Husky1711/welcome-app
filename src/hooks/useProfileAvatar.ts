import { useCallback, useEffect, useState } from 'react'
import { clearAvatarDataUrl, getAvatarDataUrl, setAvatarDataUrl } from '../utils/avatarStorage'

export function useProfileAvatar(email: string | undefined) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!email) {
      setAvatarUrl(null)
      return
    }

    setAvatarUrl(getAvatarDataUrl(email))
  }, [email])

  const applyCroppedImage = useCallback(
    async (dataUrl: string) => {
      if (!email) {
        return
      }

      setIsUpdating(true)
      try {
        setAvatarDataUrl(email, dataUrl)
        setAvatarUrl(dataUrl)
        setError(null)
      } catch (avatarError) {
        setError(
          avatarError instanceof Error ? avatarError.message : 'Could not update your photo.',
        )
        throw avatarError
      } finally {
        setIsUpdating(false)
      }
    },
    [email],
  )

  const removeAvatar = useCallback(() => {
    if (!email) {
      return
    }

    clearAvatarDataUrl(email)
    setAvatarUrl(null)
    setError(null)
  }, [email])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    avatarUrl,
    error,
    isUpdating,
    applyCroppedImage,
    removeAvatar,
    clearError,
  }
}
