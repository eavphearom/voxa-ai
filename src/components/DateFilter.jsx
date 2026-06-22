import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const presets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 3 months', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last year', days: 365 },
]

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const toDateValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplay = (value) => {
  const [year, month, day] = value.split('-')
  return `${Number(month)} / ${Number(day)} / ${year}`
}

const buildMonthDays = (year, month) => {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      value: toDateValue(date),
      day: date.getDate(),
      muted: date.getMonth() !== month,
    }
  })
}

function DateFilter({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date('2026-05-01'))
  const filterRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const closeOutside = (event) => {
      if (!filterRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const rightDate = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1), [viewDate])

  const setPreset = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    onChange({ start: toDateValue(start), end: toDateValue(end) })
  }

  const chooseDate = (date) => {
    if (!value.start || value.start !== value.end) {
      onChange({ start: date, end: date })
      return
    }

    if (date < value.start) {
      onChange({ start: date, end: value.start })
    } else {
      onChange({ start: value.start, end: date })
    }
  }

  const moveMonth = (direction) => {
    setViewDate((date) => new Date(date.getFullYear(), date.getMonth() + direction, 1))
  }

  const displayText = `${formatDisplay(value.start)} - ${formatDisplay(value.end)}`

  return (
    <div ref={filterRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-border-soft bg-white px-4 text-left shadow-sm transition hover:border-primary hover:shadow-md sm:w-[300px]"
      >
        <Calendar size={18} className="text-primary" />
        <span className="truncate text-sm font-medium text-text-primary">{displayText}</span>
      </button>

      {open && (
        <div className="absolute left-0 right-auto top-14 z-40 max-h-[68dvh] w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-border-soft bg-white shadow-2xl animate-fade-in sm:max-h-[calc(100dvh-6rem)] sm:w-[min(92vw,760px)] xl:left-auto xl:right-0">
          <div className="grid md:grid-cols-[190px_1fr]">
            <aside className="flex gap-1 overflow-x-auto border-b border-border-soft bg-sidebar p-2 md:block md:border-b-0 md:border-r md:p-3">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPreset(preset.days)}
                  className="shrink-0 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-[#EAFBF3] hover:text-primary md:block md:w-full md:rounded-xl md:py-2.5 md:text-sm"
                >
                  {preset.label}
                </button>
              ))}
            </aside>

            <section className="p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveMonth(-2)} className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:block" aria-label="Previous two months">
                    <ChevronLeft size={17} />
                  </button>
                  <button type="button" onClick={() => moveMonth(-1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Previous month">
                    <ChevronLeft size={17} />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  <span className="md:hidden">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                  <span className="hidden md:inline">{monthNames[viewDate.getMonth()]} - {monthNames[rightDate.getMonth()]} {rightDate.getFullYear()}</span>
                </h3>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveMonth(1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Next month">
                    <ChevronRight size={17} />
                  </button>
                  <button type="button" onClick={() => moveMonth(2)} className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:block" aria-label="Next two months">
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <MonthGrid date={viewDate} range={value} onChoose={chooseDate} />
                <div className="hidden md:block">
                  <MonthGrid date={rightDate} range={value} onChoose={chooseDate} />
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

function MonthGrid({ date, range, onChoose }) {
  const days = buildMonthDays(date.getFullYear(), date.getMonth())

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-primary">
        {weekDays.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center sm:gap-1">
        {days.map((day) => {
          const selected = day.value === range.start || day.value === range.end
          const inRange = day.value > range.start && day.value < range.end
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => onChoose(day.value)}
              className={`h-8 rounded-full text-sm transition sm:h-9 ${
                selected
                  ? 'bg-primary font-bold text-white shadow-sm'
                  : inRange
                    ? 'bg-[#EAFBF3] text-primary'
                    : day.muted
                      ? 'text-slate-300 hover:bg-slate-50'
                      : 'text-slate-700 hover:bg-[#EAFBF3] hover:text-primary'
              }`}
            >
              {day.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DateFilter
