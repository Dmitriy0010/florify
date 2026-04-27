import { useState, useEffect } from 'react'

export function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-end">
      <span className="text-sm font-black tabular-nums tracking-wide text-[var(--color-text-primary)]">
        {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
        {time.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
      </span>
    </div>
  )
}
