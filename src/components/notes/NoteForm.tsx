import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface NoteFormProps {
  initialTitle?: string
  initialBody?: string
  submitLabel: string
  onSubmit: (title: string, body: string) => void
  onCancel?: () => void
}

export function NoteForm({
  initialTitle = '',
  initialBody = '',
  submitLabel,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()

    if (!trimmedTitle) {
      setError('Please enter a title for your note.')
      return
    }

    if (!trimmedBody) {
      setError('Please enter note content.')
      return
    }

    setError(null)
    onSubmit(trimmedTitle, trimmedBody)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Note title"
        maxLength={100}
      />

      <div className="w-full">
        <label htmlFor="note-body" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content
        </label>
        <textarea
          id="note-body"
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write your note..."
          rows={4}
          maxLength={1000}
          className="note-form__textarea"
        />
      </div>

      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="note-form__actions">
        <Button type="submit" fullWidth>
          {submitLabel}
        </Button>
        {onCancel ? (
          <button type="button" className="note-form__cancel" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
