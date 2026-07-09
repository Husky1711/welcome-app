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
          className="w-full rounded-md border border-gray-300 bg-surface px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary dark:border-gray-600 dark:text-gray-100"
        />
      </div>

      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" fullWidth>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
