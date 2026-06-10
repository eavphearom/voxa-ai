import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const badgeColor = {
  EN: 'bg-emerald-50 text-emerald-700',
  KH: 'bg-sky-50 text-sky-700',
  CN: 'bg-amber-50 text-amber-700',
}

function MeetingCard({ meeting, onDelete }) {
  return (
    <Link
      to={`/meeting/${meeting.id}`}
      className="group flex min-h-[88px] items-center justify-between gap-4 rounded-2xl border border-border-soft bg-white px-5 py-4 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <div className="min-w-0">
        <h3 className="truncate text-lg font-medium text-text-primary">{meeting.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span>{meeting.time}</span>
          <span>{meeting.duration}</span>
          <span>{meeting.speakers} speakers</span>
          <span className="flex gap-1.5">
            {meeting.languages.map((language) => (
              <span key={language} className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeColor[language]}`}>
                {language}
              </span>
            ))}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="rounded-md p-2 text-red-500 transition hover:bg-red-50"
        aria-label={`Delete ${meeting.title}`}
        onClick={(event) => {
          event.preventDefault()
          onDelete?.(meeting.id)
        }}
      >
        <Trash2 size={20} />
      </button>
    </Link>
  )
}

export default MeetingCard
