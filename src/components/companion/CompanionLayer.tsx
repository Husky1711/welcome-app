import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useSettings } from '../../contexts/SettingsContext'
import {
  COMPANION_TIMING,
  nextAppearanceDelay,
  pickMoment,
  type CompanionActivity,
} from '../../utils/companion'
import { readCompanionContext } from '../../utils/companionContext'
import {
  buildEdgeSpots,
  buildPerchSpots,
  chooseSpot,
  type CompanionSpot,
  type Rect,
} from '../../utils/companionStage'
import { scheduleDelay } from '../../utils/companionTimer'
import { CompanionSprite } from './CompanionSprite'

type Phase = 'hidden' | 'appearing' | 'holding' | 'crossing' | 'leaving'

interface Visual {
  phase: Phase
  x: number
  y: number
  facing: 1 | -1
  kind: CompanionSpot['kind']
  from: 'left' | 'right'
  activity: CompanionActivity
  message: string | null
  moveMs: number
}

const SPRITE_SIZE = 64
/** Routes where the companion must never appear. */
const BLOCKED_EXACT = new Set<string>([ROUTES.LOGIN, ROUTES.SIGN_UP, ROUTES.FORGOT_PASSWORD])

/** Elements the companion is happy to perch on. Edges are the safe fallback. */
const ANCHOR_SELECTOR = [
  '.note-card',
  '.welcome-dashboard__today',
  '.welcome-dashboard__notes',
  '.welcome-dashboard__coach',
  '.settings-panel',
  '.settings-hero',
  '.bottom-nav__pill',
].join(',')

/** Controls/inputs the sprite must not cover. */
const NO_GO_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'textarea',
  'select',
  '[role="button"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
].join(',')

/** If any of these exist, a modal/sheet is open and the companion stays away. */
const MODAL_SELECTOR = [
  '[aria-modal="true"]',
  '[role="dialog"]',
  '.note-task-sheet',
  '.note-image-preview',
].join(',')

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isTextTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el || !el.tagName) return false
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.isContentEditable === true
  )
}

function toRect(el: Element): Rect {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}

function collectRects(selector: string): Rect[] {
  const out: Rect[] = []
  document.querySelectorAll(selector).forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) out.push(toRect(el))
  })
  return out
}

const HIDDEN: Visual = {
  phase: 'hidden',
  x: 0,
  y: 0,
  facing: 1,
  kind: 'edge-left',
  from: 'left',
  activity: 'idle',
  message: null,
  moveMs: 0,
}

export function CompanionLayer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { settings } = useSettings()
  const [visual, setVisual] = useState<Visual>(HIDDEN)
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion)
  const [typing, setTyping] = useState(false)

  const reactingRef = useRef(false)
  const visibleRef = useRef(false)
  const canFleeRef = useRef(false)
  const settledAtRef = useRef(0)
  const fleeRef = useRef<() => void>(() => {})
  const [status, setStatus] = useState('boot')

  const routeAllowed =
    !BLOCKED_EXACT.has(location.pathname) &&
    // Note editor is dynamic (/notes/:id) — keep the writing canvas clean.
    !/^\/notes\/.+/.test(location.pathname)

  const active = settings.companionEnabled !== false && !reduceMotion && !typing && routeAllowed

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return
    const onChange = () => setReduceMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (isTextTarget(e.target)) setTyping(true)
    }
    const onFocusOut = (e: FocusEvent) => {
      if (isTextTarget(e.target)) setTyping(false)
    }
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  // Flee on intentional user scroll/wheel after a short grace window.
  useEffect(() => {
    let lastY = window.scrollY
    const maybeFlee = (delta: number) => {
      if (Math.abs(delta) < 14) return
      if (!visibleRef.current || !canFleeRef.current) return
      if (Date.now() - settledAtRef.current < 2_500) return
      fleeRef.current()
    }
    const onScroll = () => {
      const y = window.scrollY
      maybeFlee(y - lastY)
      lastY = y
    }
    const onWheel = (event: WheelEvent) => maybeFlee(event.deltaY)
    const onTouchMove = () => {
      if (!visibleRef.current || !canFleeRef.current) return
      if (Date.now() - settledAtRef.current < 2_500) return
      fleeRef.current()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  useEffect(() => {
    if (!active) {
      setVisual(HIDDEN)
      visibleRef.current = false
      canFleeRef.current = false
      setStatus('off')
      return
    }

    let cancelled = false
    const handles: Array<{ cancel: () => void }> = []
    const wait = (fn: () => void, ms: number) => {
      handles.push(scheduleDelay(() => !cancelled && fn(), ms))
    }

    const modalOpen = () => document.querySelector(MODAL_SELECTOR) !== null

    const roamBand = () => {
      const header = document.querySelector('header, .app-header')
      const nav = document.querySelector('.bottom-nav__pill')
      const top = header ? header.getBoundingClientRect().bottom + 8 : 72
      const bottom = nav
        ? nav.getBoundingClientRect().top - 6
        : window.innerHeight - 24
      return { top, bottom }
    }

    /** Prefer the centered app column so the companion isn't lost in desktop gutters. */
    const roamViewport = () => {
      const column =
        document.querySelector('main .max-w-md') ||
        document.querySelector('.welcome-dashboard') ||
        document.querySelector('main')
      if (column) {
        const r = column.getBoundingClientRect()
        if (r.width >= 280) {
          return { width: Math.round(r.width), height: window.innerHeight, left: r.left }
        }
      }
      return { width: window.innerWidth, height: window.innerHeight, left: 0 }
    }

    const hideThenReschedule = (delay: number) => {
      setVisual(HIDDEN)
      visibleRef.current = false
      canFleeRef.current = false
      setStatus('waiting')
      wait(appear, delay)
    }

    const leave = (_reason = 'dwell') => {
      reactingRef.current = false
      canFleeRef.current = false
      setStatus(`leaving`)
      setVisual((v) => ({ ...v, phase: 'leaving', message: null, moveMs: 320 }))
      wait(() => hideThenReschedule(nextAppearanceDelay()), 360)
    }
    fleeRef.current = () => leave('flee')

    const settle = (
      spot: CompanionSpot,
      band: { top: number; bottom: number },
      originLeft: number,
    ) => {
      const toScreenX = (x: number) => originLeft + x

      if (spot.kind === 'cross') {
        // Cross within the content column.
        const crossStart = spot.from === 'left' ? originLeft - SPRITE_SIZE : toScreenX(spot.x) + SPRITE_SIZE
        const crossEnd = spot.from === 'left' ? toScreenX(spot.x) + SPRITE_SIZE : originLeft - SPRITE_SIZE
        const facing: 1 | -1 = spot.from === 'left' ? 1 : -1
        setStatus('cross')
        setVisual({
          phase: 'appearing',
          x: crossStart,
          y: band.bottom,
          facing,
          kind: 'cross',
          from: spot.from,
          activity: 'idle',
          message: null,
          moveMs: 0,
        })
        wait(() => {
          const dist = Math.abs(crossEnd - crossStart)
          const ms = Math.max(1400, Math.round((dist / 150) * 1000))
          setVisual((v) => ({ ...v, phase: 'crossing', x: crossEnd, moveMs: ms }))
          wait(() => leave('cross'), ms)
        }, 60)
        return
      }

      const moment = pickMoment(readCompanionContext())
      const facing: 1 | -1 = spot.from === 'left' ? 1 : -1
      setStatus(`show:${spot.kind}`)
      setVisual({
        phase: 'appearing',
        x: toScreenX(spot.x),
        y: spot.y,
        facing,
        kind: spot.kind,
        from: spot.from,
        activity: 'idle',
        message: null,
        moveMs: 0,
      })
      wait(() => {
        setVisual((v) => ({
          ...v,
          phase: 'holding',
          activity: moment.activity,
          message: moment.message,
        }))
        // Allow scroll-flee only after the companion has fully settled.
        canFleeRef.current = true
        settledAtRef.current = Date.now()
        const dwellMs = COMPANION_TIMING.activityMs
        const dwellStarted = Date.now()
        setStatus('holding')
        const dwellPoll = window.setInterval(() => {
          if (cancelled || reactingRef.current) {
            window.clearInterval(dwellPoll)
            return
          }
          const elapsed = Date.now() - dwellStarted
          if (elapsed >= dwellMs) {
            window.clearInterval(dwellPoll)
            leave('dwell')
          }
        }, 500)
        handles.push({ cancel: () => window.clearInterval(dwellPoll) })
      }, 380)
    }

    const appear = () => {
      if (cancelled) return

      // Never intrude on a modal or an active text field.
      if (modalOpen() || isTextTarget(document.activeElement)) {
        setStatus('blocked:focus')
        wait(appear, 4_000)
        return
      }

      const band = roamBand()
      if (band.bottom - band.top < SPRITE_SIZE * 1.5) {
        setStatus('blocked:band')
        wait(appear, 6_000)
        return
      }

      const stage = roamViewport()
      const viewport = { width: stage.width, height: stage.height }
      const anchors = collectRects(ANCHOR_SELECTOR).map((rect) => ({
        ...rect,
        left: rect.left - stage.left,
      }))
      // Only treat large controls as blockers — tiny icons shouldn't veto edges.
      const noGo = collectRects(NO_GO_SELECTOR)
        .filter((rect) => rect.width >= 28 && rect.height >= 28)
        .map((rect) => ({ ...rect, left: rect.left - stage.left }))
      const perchSpots = buildPerchSpots(anchors, band, SPRITE_SIZE)
      const edgeSpots = buildEdgeSpots(viewport, band, SPRITE_SIZE)
      const spot = chooseSpot(perchSpots, edgeSpots, SPRITE_SIZE, noGo)

      // Everything is occupied right now — try again shortly.
      if (!spot) {
        setStatus('blocked:nospot')
        wait(appear, 5_000)
        return
      }

      visibleRef.current = true
      canFleeRef.current = false
      settle(spot, band, stage.left)
    }

    setStatus('scheduled')
    wait(appear, COMPANION_TIMING.firstDelayMs)

    const forceAppear = () => {
      if (!visibleRef.current) appear()
    }
    document.addEventListener('companion:appear', forceAppear)

    return () => {
      cancelled = true
      canFleeRef.current = false
      document.removeEventListener('companion:appear', forceAppear)
      for (const h of handles) h.cancel()
    }
  }, [active])

  const handleTap = useCallback(() => {
    // React-then-Coach: first tap plays a reaction, a quick second tap opens Coach.
    if (reactingRef.current) {
      reactingRef.current = false
      setVisual(HIDDEN)
      visibleRef.current = false
      navigate(ROUTES.COMPANION)
      return
    }
    reactingRef.current = true
    setVisual((v) => ({ ...v, phase: 'holding', activity: 'celebrate', message: 'Tap again for Leafu' }))
    scheduleDelay(() => {
      if (!reactingRef.current) return
      reactingRef.current = false
      fleeRef.current()
    }, 2_200)
  }, [navigate])

  const visible = visual.phase !== 'hidden'

  return (
    <div
      className="companion-stage"
      aria-hidden="true"
      data-active={active ? 'true' : 'false'}
      data-status={status}
    >
      {visible ? (
        <button
          type="button"
          tabIndex={-1}
          className="companion"
          data-phase={visual.phase}
          data-kind={visual.kind}
          data-from={visual.from}
          data-activity={visual.activity}
          style={{
            left: `${visual.x}px`,
            top: `${visual.y}px`,
            transitionDuration: `${visual.moveMs}ms`,
          }}
          onClick={handleTap}
        >
          <span className="companion__flip" data-facing={visual.facing}>
            <CompanionSprite activity={visual.activity} talking={Boolean(visual.message)} />
          </span>
          {visual.message ? <span className="companion__bubble">{visual.message}</span> : null}
        </button>
      ) : null}
    </div>
  )
}
