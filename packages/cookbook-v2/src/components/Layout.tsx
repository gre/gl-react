import { useState, useEffect, useRef, type ReactNode } from 'react'
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline'
import GLInspector from './GLInspector'

const DEFAULT_HEIGHT = 500

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [height, setHeight] = useState(DEFAULT_HEIGHT)
  const [hoveredCanvas, setHoveredCanvas] = useState<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLButtonElement>(null)

  const openInspector = () => { setHeight(DEFAULT_HEIGHT); setOpen(true) }

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY, startH = height
    const onMove = (e: MouseEvent) => {
      const h = startH + startY - e.clientY
      if (h < 100) { setOpen(false); cleanup() }
      else setHeight(Math.min(window.innerHeight - 100, h))
    }
    const onUp = () => cleanup()
    const cleanup = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  useEffect(() => {
    const onOver = (e: MouseEvent) => setHoveredCanvas((e.target as HTMLElement).closest('canvas') as HTMLCanvasElement | null)
    const onOut = (e: MouseEvent) => { if (!(e.relatedTarget as HTMLElement)?.closest('canvas') && e.relatedTarget !== overlayRef.current) setHoveredCanvas(null) }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => { document.removeEventListener('mouseover', onOver); document.removeEventListener('mouseout', onOut) }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <main className="flex-1 overflow-auto" style={open ? { paddingBottom: height } : undefined}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>

      {!open && hoveredCanvas && (() => {
        const r = hoveredCanvas.getBoundingClientRect()
        return <button ref={overlayRef} onClick={() => { openInspector(); setHoveredCanvas(null) }} className="fixed z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 opacity-50 hover:opacity-100" style={{ top: r.top + 6, left: r.right - 34 }} title="Inspect GL"><EyeIcon className="h-4 w-4" /></button>
      })()}

      {!open && <button onClick={openInspector} className="fixed z-50 bottom-4 right-4 rounded-full p-3 shadow-lg bg-primary-600 hover:bg-primary-700 text-white" title="Open GL Inspector"><EyeIcon className="h-5 w-5" /></button>}

      {open && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white flex flex-col" style={{ height }}>
          <div onMouseDown={onResizeStart} className="cursor-ns-resize bg-gray-300 hover:bg-primary-400 transition-colors shrink-0 -mt-2" style={{ height: 3, paddingTop: 8, backgroundClip: 'content-box' }} />
          <div className="overflow-auto flex-1"><GLInspector /></div>
          <button onClick={() => setOpen(false)} className="absolute bottom-4 right-4 z-[60] rounded-full p-3 shadow-lg bg-gray-600 hover:bg-gray-700 text-white" title="Close GL Inspector"><XMarkIcon className="h-5 w-5" /></button>
        </div>
      )}
    </div>
  )
}
