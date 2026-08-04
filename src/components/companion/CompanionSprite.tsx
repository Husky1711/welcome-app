import type { CompanionActivity } from '../../utils/companion'

type MouthKind = 'smile' | 'grin' | 'smirk' | 'o' | 'talk'

function mouthFor(activity: CompanionActivity, talking: boolean): MouthKind {
  if (talking) return 'talk'
  if (activity === 'celebrate' || activity === 'wave') return 'grin'
  if (activity === 'point') return 'smirk'
  if (activity === 'nap') return 'o'
  return 'smile'
}

interface CompanionSpriteProps {
  activity: CompanionActivity
  /** True while a speech bubble is showing — mouth cycles as if speaking. */
  talking?: boolean
}

/**
 * Sprout v2 — rubber-hose limbs, cartoon gloves, boots, and expression mouths.
 * Pose limbs are driven by CSS via the parent `data-activity` attribute.
 */
export function CompanionSprite({ activity, talking = false }: CompanionSpriteProps) {
  const eyesClosed = activity === 'nap' || activity === 'celebrate'
  const mouth = mouthFor(activity, talking)

  return (
    <svg
      className="companion-sprite"
      viewBox="0 0 56 68"
      role="presentation"
      focusable="false"
    >
      <ellipse className="companion-sprite__shadow" cx="28" cy="64" rx="12" ry="2.6" />

      {/* Leaves */}
      <g className="companion-sprite__sprout">
        <path className="companion-sprite__stem" d="M28 22V12" />
        <path
          className="companion-sprite__leaf companion-sprite__leaf--left"
          d="M28 14C22.2 14 18.2 10.4 17.6 5C23.8 4.6 28 8.4 28 14Z"
        />
        <path
          className="companion-sprite__leaf companion-sprite__leaf--right"
          d="M28 14C33.8 14 37.8 10.4 38.4 5C32.2 4.6 28 8.4 28 14Z"
        />
      </g>

      {/* Left arm + glove */}
      <g className="companion-sprite__limb companion-sprite__limb--arm-left">
        <path className="companion-sprite__arm-line" d="M16 34C11 33 7.5 29.5 6.5 25" />
        <g className="companion-sprite__glove companion-sprite__glove--left">
          <ellipse cx="6.2" cy="22.5" rx="4.2" ry="3.6" />
          <path d="M3.2 20.2C2.4 18.6 1.2 18.2 0.8 19.2C0.4 20.2 1.4 21.4 2.6 21.8" />
        </g>
      </g>

      {/* Right arm + glove */}
      <g className="companion-sprite__limb companion-sprite__limb--arm-right">
        <path className="companion-sprite__arm-line" d="M40 34C45 33 48.5 29.5 49.5 25" />
        <g className="companion-sprite__glove companion-sprite__glove--right">
          <ellipse cx="49.8" cy="22.5" rx="4.2" ry="3.6" />
          <path d="M52.8 20.2C53.6 18.6 54.8 18.2 55.2 19.2C55.6 20.2 54.6 21.4 53.4 21.8" />
        </g>
      </g>

      {/* Legs + boots */}
      <g className="companion-sprite__limb companion-sprite__limb--leg-left">
        <path className="companion-sprite__leg-line" d="M23 48V56" />
        <path
          className="companion-sprite__boot"
          d="M18.5 56C18.5 56 19 61 23 61.5C27 61.5 27.5 56 27.5 56Z"
        />
      </g>
      <g className="companion-sprite__limb companion-sprite__limb--leg-right">
        <path className="companion-sprite__leg-line" d="M33 48V56" />
        <path
          className="companion-sprite__boot"
          d="M28.5 56C28.5 56 29 61 33 61.5C37 61.5 37.5 56 37.5 56Z"
        />
      </g>

      {/* Body */}
      <circle className="companion-sprite__body" cx="28" cy="36" r="14.5" />

      {/* Face */}
      <g className="companion-sprite__face">
        <ellipse className="companion-sprite__blush" cx="20.2" cy="39.2" rx="2.4" ry="1.5" />
        <ellipse className="companion-sprite__blush" cx="35.8" cy="39.2" rx="2.4" ry="1.5" />

        {eyesClosed ? (
          activity === 'celebrate' ? (
            <>
              <path className="companion-sprite__eye-lid" d="M21 34.2Q23.2 31.6 25.4 34.2" />
              <path className="companion-sprite__eye-lid" d="M30.6 34.2Q32.8 31.6 35 34.2" />
            </>
          ) : (
            <>
              <path className="companion-sprite__eye-lid" d="M21 34.6Q23.2 36.4 25.4 34.6" />
              <path className="companion-sprite__eye-lid" d="M30.6 34.6Q32.8 36.4 35 34.6" />
            </>
          )
        ) : (
          <>
            <ellipse className="companion-sprite__eye" cx="23.2" cy="34.2" rx="2.4" ry="2.9" />
            <ellipse className="companion-sprite__eye" cx="32.8" cy="34.2" rx="2.4" ry="2.9" />
            <circle className="companion-sprite__eye-glint" cx="24" cy="33.2" r="0.7" />
            <circle className="companion-sprite__eye-glint" cx="33.6" cy="33.2" r="0.7" />
          </>
        )}

        {mouth === 'smile' ? (
          <path className="companion-sprite__mouth" d="M24.2 41.2Q28 44.2 31.8 41.2" />
        ) : null}

        {mouth === 'smirk' ? (
          <path className="companion-sprite__mouth" d="M24.6 41.4Q27.2 43.6 31.6 40.8" />
        ) : null}

        {mouth === 'o' ? (
          <ellipse className="companion-sprite__mouth-fill" cx="28" cy="41.6" rx="1.6" ry="1.8" />
        ) : null}

        {mouth === 'grin' ? (
          <path
            className="companion-sprite__mouth-fill companion-sprite__mouth-fill--grin"
            d="M23.4 40.2H32.6A4.2 4.2 0 0 1 23.4 40.2Z"
          />
        ) : null}

        {mouth === 'talk' ? (
          <g className="companion-sprite__talk" aria-hidden="true">
            <ellipse
              className="companion-sprite__mouth-fill companion-sprite__talk-a"
              cx="28"
              cy="41.4"
              rx="1.5"
              ry="1.7"
            />
            <ellipse
              className="companion-sprite__mouth-fill companion-sprite__talk-b"
              cx="28"
              cy="41.4"
              rx="2.4"
              ry="2.8"
            />
            <path
              className="companion-sprite__mouth companion-sprite__talk-c"
              d="M24.2 41.2Q28 44.2 31.8 41.2"
            />
          </g>
        ) : null}
      </g>

      {activity === 'nap' ? (
        <g className="companion-sprite__zzz" aria-hidden="true">
          <text className="companion-sprite__z companion-sprite__z--1" x="40" y="18">
            z
          </text>
          <text className="companion-sprite__z companion-sprite__z--2" x="45" y="12">
            z
          </text>
        </g>
      ) : null}

      {activity === 'celebrate' ? (
        <g className="companion-sprite__sparks" aria-hidden="true">
          <path className="companion-sprite__spark companion-sprite__spark--1" d="M8 20L9 23L12 24L9 25L8 28L7 25L4 24L7 23Z" />
          <path className="companion-sprite__spark companion-sprite__spark--2" d="M48 18L49 21L52 22L49 23L48 26L47 23L44 22L47 21Z" />
          <path className="companion-sprite__spark companion-sprite__spark--3" d="M28 4L28.8 6.4L31.2 7.2L28.8 8L28 10.4L27.2 8L24.8 7.2L27.2 6.4Z" />
        </g>
      ) : null}
    </svg>
  )
}
