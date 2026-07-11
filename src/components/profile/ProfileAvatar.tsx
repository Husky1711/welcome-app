import { useId, useRef, useState, type ChangeEvent } from 'react'
import { validateImageFile } from '../../utils/imageUpload'
import { CircularImageCropper } from '../ui/CircularImageCropper'

const PROFILE_AVATAR_OUTPUT_SIZE = 256

interface ProfileAvatarProps {
  initials: string
  avatarUrl: string | null
  isUpdating: boolean
  onApplyImage: (dataUrl: string) => Promise<void>
  onRemove: () => void
}

export function ProfileAvatar({
  initials,
  avatarUrl,
  isUpdating,
  onApplyImage,
  onRemove,
}: ProfileAvatarProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [cropSource, setCropSource] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function closeCropper() {
    if (cropSource?.startsWith('blob:')) {
      URL.revokeObjectURL(cropSource)
    }
    setCropSource(null)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      validateImageFile(file)
      const objectUrl = URL.createObjectURL(file)
      setCropSource(objectUrl)
      setUploadError(null)
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error ? uploadFailure.message : 'Could not upload that image.',
      )
    }
  }

  async function handleCropApply(dataUrl: string) {
    try {
      await onApplyImage(dataUrl)
      setUploadError(null)
      closeCropper()
    } catch {
      // Parent hook stores the error message.
    }
  }

  return (
    <div className="profile-avatar-block">
      <button
        type="button"
        className="profile-avatar-btn"
        onClick={() => inputRef.current?.click()}
        disabled={isUpdating || cropSource !== null}
        aria-label={avatarUrl ? 'Change profile photo' : 'Add profile photo'}
      >
        <span className="profile-avatar" aria-hidden="true">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="profile-avatar__image" />
          ) : (
            initials
          )}
        </span>
        <span className="profile-avatar-btn__badge" aria-hidden="true">
          {isUpdating ? '…' : '+'}
        </span>
      </button>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="profile-avatar-input"
        onChange={handleFileChange}
        disabled={isUpdating || cropSource !== null}
        tabIndex={-1}
      />

      {uploadError ? (
        <p className="profile-avatar-block__error" role="alert">
          {uploadError}
        </p>
      ) : null}

      {avatarUrl ? (
        <button
          type="button"
          className="profile-avatar-remove"
          onClick={onRemove}
          disabled={isUpdating || cropSource !== null}
        >
          Remove photo
        </button>
      ) : null}

      <CircularImageCropper
        open={cropSource !== null}
        imageSrc={cropSource ?? ''}
        title="Adjust your photo"
        hint="Drag to reposition. Use the slider or scroll to zoom."
        outputSize={PROFILE_AVATAR_OUTPUT_SIZE}
        confirmLabel="Use photo"
        onApply={handleCropApply}
        onCancel={closeCropper}
      />
    </div>
  )
}
