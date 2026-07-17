import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import html2canvas from 'html2canvas'

export async function captureElementToPng(element: HTMLElement): Promise<string> {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#f7f6f3',
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
  })

  return canvas.toDataURL('image/png')
}

function dataUrlToBase64(dataUrl: string): string {
  const parts = dataUrl.split(',')
  return parts[1] ?? ''
}

async function downloadPng(dataUrl: string, fileName: string): Promise<void> {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export async function shareHabitImage(options: {
  dataUrl: string
  title: string
  text: string
}): Promise<void> {
  const { dataUrl, title, text } = options
  const fileName = `welcome-streak-${Date.now()}.png`

  if (Capacitor.isNativePlatform()) {
    const written = await Filesystem.writeFile({
      path: fileName,
      data: dataUrlToBase64(dataUrl),
      directory: Directory.Cache,
    })

    await Share.share({
      title,
      text,
      files: [written.uri],
      dialogTitle: 'Share streak',
    })
    return
  }

  const blob = await (await fetch(dataUrl)).blob()
  const file = new File([blob], fileName, { type: 'image/png' })

  if (typeof navigator.share === 'function') {
    const payload: ShareData = { title, text, files: [file] }
    if (navigator.canShare?.(payload)) {
      await navigator.share(payload)
      return
    }

    try {
      await navigator.share({ title, text })
    } catch {
      // fall through to download
    }
  }

  await downloadPng(dataUrl, fileName)
}
