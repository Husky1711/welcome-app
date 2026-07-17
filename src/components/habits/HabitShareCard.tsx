import type { RefObject } from 'react'
import appIcon from '../../assets/app-icon.png'
import { isHabitIconImage } from '../../utils/habitIcon'
import type { HabitShareModel } from '../../utils/habitShareModel'

interface HabitShareCardProps {
  model: HabitShareModel
  cardRef?: RefObject<HTMLDivElement | null>
}

export function HabitShareCard({ model, cardRef }: HabitShareCardProps) {
  return (
    <div ref={cardRef} className="habit-share-card" data-testid="habit-share-card">
      <div className="habit-share-card__body">
        <div className="habit-share-card__icon" aria-hidden="true">
          {isHabitIconImage(model.icon) ? (
            <img src={model.icon} alt="" className="habit-share-card__icon-image" />
          ) : (
            <span className="habit-share-card__emoji">{model.icon}</span>
          )}
        </div>

        <p className="habit-share-card__headline">{model.headline}</p>
        <p className="habit-share-card__title">{model.title}</p>

        <div className="habit-share-card__dots" aria-hidden="true">
          {model.last7.map((done, index) => (
            <span
              key={index}
              className={
                done
                  ? 'habit-share-card__dot habit-share-card__dot--filled'
                  : 'habit-share-card__dot'
              }
            />
          ))}
        </div>

        <p className="habit-share-card__meta">
          {model.completedInLast7} of last 7 days
        </p>
      </div>

      <footer className="habit-share-card__footer">
        <img src={appIcon} alt="" className="habit-share-card__brand-icon" />
        <div className="habit-share-card__brand-copy">
          <span className="habit-share-card__brand-name">Welcome</span>
          <span className="habit-share-card__brand-tag">Track yours →</span>
        </div>
      </footer>
    </div>
  )
}
