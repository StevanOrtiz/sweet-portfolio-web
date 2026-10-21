import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, X } from 'lucide-react'

type ToastItem = { id: number; text: string; kind: 'ok' | 'error'; action?: { label: string; run: () => void } }
const ToastCtx = createContext<{ push: (t: Omit<ToastItem, 'id'>) => void } | null>(null)

export const useToast = () => {
  const c = useContext(ToastCtx)
  if (!c) throw new Error('useToast outside ToastProvider')
  return c
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const dismiss = (id: number) => setItems((l) => l.filter((t) => t.id !== id))
  const push = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = nextId.current++
    setItems((l) => [...l.slice(-3), { ...t, id }])
    setTimeout(() => dismiss(id), t.action ? 8000 : 3500)
  }, [])

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-14 z-[300] flex flex-col items-end gap-2" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 24 }}
              className="pointer-events-auto flex items-center gap-2 rounded-md border bg-studio-panel px-3 py-2 text-sm shadow-xl"
              style={{ borderColor: t.kind === 'ok' ? '#7fd4a066' : '#e5726a88' }}>
              {t.kind === 'ok' ? <Check size={16} className="text-studio-ok" /> : <AlertTriangle size={16} className="text-red-400" />}
              <span>{t.text}</span>
              {t.action && <button className="ml-2 font-semibold text-studio-accent hover:underline" onClick={() => { t.action!.run(); dismiss(t.id) }}>{t.action.label}</button>}
              <button aria-label="Dismiss" className="ml-1 text-studio-dim hover:text-white" onClick={() => dismiss(t.id)}><X size={14} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export function ConfirmModal({ open, title, text, confirmLabel, danger, onConfirm, onCancel }: {
  open: boolean; title: string; text: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
          <motion.div role="alertdialog" aria-label={title} initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
            className="w-full max-w-sm rounded-md border border-studio-border bg-studio-panel p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-studio-dim">{text}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn" onClick={onCancel} autoFocus>Cancel</button>
              <button className="rounded px-3 py-1 text-sm font-semibold text-white transition-all hover:brightness-110" style={{ background: danger ? '#c4473f' : '#3a6f8a' }} onClick={onConfirm}>{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${checked ? 'border-studio-accent bg-studio-accent/30' : 'border-studio-border bg-studio-bg'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${checked ? 'left-6 bg-studio-accent' : 'left-1 bg-studio-dim'}`} />
    </button>
  )
}
