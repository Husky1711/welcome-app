/**
 * Delay helper for the companion. Prefers a plain page timer; a Worker is used
 * as a backup only when the page timer is likely to be throttled (hidden tab).
 */
type DelayHandle = { cancel: () => void }

let worker: Worker | null = null
let nextId = 1
const pending = new Map<number, () => void>()

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null
  if (worker) return worker

  try {
    const source = `
      const timers = new Map();
      onmessage = (event) => {
        const { id, ms, type } = event.data || {};
        if (type === 'clear') {
          const handle = timers.get(id);
          if (handle) clearTimeout(handle);
          timers.delete(id);
          return;
        }
        const handle = setTimeout(() => {
          timers.delete(id);
          postMessage({ id });
        }, ms);
        timers.set(id, handle);
      };
    `
    worker = new Worker(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })))
    worker.onmessage = (event: MessageEvent<{ id: number }>) => {
      const callback = pending.get(event.data.id)
      pending.delete(event.data.id)
      callback?.()
    }
    return worker
  } catch {
    worker = null
    return null
  }
}

export function scheduleDelay(callback: () => void, ms: number): DelayHandle {
  let settled = false
  const run = () => {
    if (settled) return
    settled = true
    callback()
  }

  // Always schedule a page timer so HMR / Strict Mode cancel paths stay simple.
  const pageTimer = window.setTimeout(run, ms)

  // When the tab is hidden, page timers may throttle — add a Worker backup.
  let workerId: number | null = null
  const host = typeof document !== 'undefined' && document.hidden ? getWorker() : null
  if (host) {
    workerId = nextId++
    pending.set(workerId, run)
    host.postMessage({ id: workerId, ms, type: 'delay' })
  }

  return {
    cancel: () => {
      settled = true
      window.clearTimeout(pageTimer)
      if (host && workerId !== null) {
        pending.delete(workerId)
        host.postMessage({ id: workerId, type: 'clear' })
      }
    },
  }
}
