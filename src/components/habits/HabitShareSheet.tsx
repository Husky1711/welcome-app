import { useRef, useState } from 'react'
import type { Habit } from '../../types/habit'
import { buildHabitShareModel } from '../../utils/habitShareModel'
import {
  captureElementToPng,
  shareHabitImage,
} from '../../services/habitShareService'
import { HabitShareCard } from './HabitShareCard'
import '../../styles/habit-share.css'

interface HabitShareSheetProps {
  habit: Habit
  onClose: () => void
}

export function HabitShareSheet({ habit, onClose }: HabitShareSheetProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const model = buildHabitShareModel(habit)

  async function handleShare() {
    if (!cardRef.current || !model.canShare || busy) return

    setBusy(true)
    setError(null)

    try {
      const dataUrl = await captureElementToPng(cardRef.current)
      await shareHabitImage({
        dataUrl,
        title: `${habit.title} streak`,
        text: model.shareText,
      })
      onClose()
    } catch (shareError) {
      if (
        shareError instanceof Error &&
        /AbortError|canceled|cancelled/i.test(shareError.name + shareError.message)
      ) {
        return
      }
      setError('Could not share right now. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="habit-share-sheet" role="dialog" aria-modal="true" aria-label="Share streak">
      <button
        type="button"
        className="habit-share-sheet__backdrop"
        aria-label="Dismiss"
        onClick={onClose}
      />

      <div className="habit-share-sheet__panel">
        <header className="habit-share-sheet__header">
          <h2 className="habit-share-sheet__title">Share streak</h2>
          <button type="button" className="habit-share-sheet__close" onClick={onClose}>
            Close
          </button>
        </header>

        {model.canShare ? (
          <>
            <div className="habit-share-sheet__preview">
              <HabitShareCard model={model} cardRef={cardRef} />
            </div>

            {error ? (
              <p className="habit-share-sheet__error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              className="habit-share-sheet__share"
              onClick={() => void handleShare()}
              disabled={busy}
            >
              {busy ? 'Preparing…' : 'Share'}
            </button>
          </>
        ) : (
          <p className="habit-share-sheet__empty">
            Complete this habit at least once to unlock a shareable card.
          </p>
        )}
      </div>
    </div>
  )
}
