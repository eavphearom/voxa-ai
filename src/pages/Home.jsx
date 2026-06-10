import { ChevronDown, ChevronUp, Inbox } from 'lucide-react'
import { useMemo, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import ImportModal from '../components/ImportModal'
import MeetingCard from '../components/MeetingCard'
import StatsCard from '../components/StatsCard'
import TopBar from '../components/TopBar'
import { groupMeetingsByDate, meetings as initialMeetings, stats } from '../data/mockData'

function Home() {
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState({ start: '2026-05-20', end: '2026-05-21' })
  const [meetings, setMeetings] = useState(initialMeetings)
  const [importOpen, setImportOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [openGroups, setOpenGroups] = useState(() => ({
    'Today, May 2026': true,
    '20 May 2026': true,
  }))

  const filteredMeetings = useMemo(() => {
    const term = search.trim().toLowerCase()
    return meetings.filter((meeting) => {
      const matchesSearch = !term || [meeting.title, meeting.summaryPreview, meeting.time, meeting.duration, ...meeting.languages]
        .join(' ')
        .toLowerCase()
        .includes(term)
      const matchesDate = meeting.date >= dateRange.start && meeting.date <= dateRange.end
      return matchesSearch && matchesDate
    })
  }, [dateRange, meetings, search])

  const groupedMeetings = groupMeetingsByDate(filteredMeetings)

  const confirmDelete = () => {
    setMeetings((items) => items.filter((meeting) => meeting.id !== deleteTarget?.id))
    setDeleteTarget(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 animate-fade-in">
      <TopBar
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onImport={() => setImportOpen(true)}
      />

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">AI Statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Recent Meetings</h2>
          <p className="mt-1 text-sm text-text-secondary">Search, import, record, and review multilingual meeting notes.</p>
        </div>

        {groupedMeetings.length > 0 ? (
          groupedMeetings.map((group) => (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => setOpenGroups((groups) => ({ ...groups, [group.label]: !groups[group.label] }))}
                className="mb-4 flex items-center gap-2 rounded-lg text-left transition hover:text-primary"
              >
                <h3 className="text-lg font-semibold text-text-primary">{group.label}</h3>
                {openGroups[group.label] ?? true ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
              </button>
              {(openGroups[group.label] ?? true) && (
                <div className="space-y-4 animate-fade-in">
                  {group.meetings.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} onDelete={() => setDeleteTarget(meeting)} />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border-soft bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAFBF3] text-primary">
              <Inbox size={26} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">No meetings found</h3>
            <p className="mt-2 text-sm text-text-secondary">Try another search term or import a meeting file.</p>
          </div>
        )}
      </section>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete meeting?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This only removes it from the current demo list.`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default Home
