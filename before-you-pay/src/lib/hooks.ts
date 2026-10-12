import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

/** Current time, refreshed every 60 seconds and when the tab regains focus (rule 7.5). */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const tick = () => setNow(new Date())
    const timer = window.setInterval(tick, 60_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  return now
}

/** Calls onChange when any request or answer changes in the database (rule 7.10). */
export function useLiveChanges(channel: string, onChange: () => void) {
  const latest = useRef(onChange)
  useEffect(() => {
    latest.current = onChange
  })

  useEffect(() => {
    let debounce: number | undefined
    const fire = () => {
      window.clearTimeout(debounce)
      debounce = window.setTimeout(() => latest.current(), 250)
    }
    const sub = supabase
      .channel(channel)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brief_answers' }, fire)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_requests' }, fire)
      .subscribe()
    return () => {
      window.clearTimeout(debounce)
      supabase.removeChannel(sub)
    }
  }, [channel])
}
