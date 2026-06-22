import { Folder, FolderMinus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'

function Communication() {
  const { id } = useParams()
  const {
    folders,
    foldersLoading,
    folderMeetings,
    folderMeetingsLoading,
    loadFolderMeetings,
    removeMeetingFromFolder,
  } = useOutletContext()
  const [error, setError] = useState('')
  const folder = folders.find((item) => item.id === id)
  const meetings = folderMeetings[id] || []

  useEffect(() => {
    loadFolderMeetings(id).catch((requestError) => {
      console.error('Load folder meetings failed:', requestError)
      setError(requestError.message)
    })
  }, [id, loadFolderMeetings])

  const removeMeeting = async (meetingId) => {
    setError('')
    try {
      await removeMeetingFromFolder(id, meetingId)
    } catch (requestError) {
      console.error('Remove meeting from folder failed:', requestError)
      setError(requestError.message)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-primary">
          <Folder size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {folder?.name || (foldersLoading ? 'Loading folder...' : 'Folder')}
          </h1>
          <p className="text-sm text-text-secondary">Meetings saved in this folder.</p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-3">
        {folderMeetingsLoading[id] && (
          <div className="rounded-2xl border border-border-soft bg-white p-6 text-sm text-text-secondary">
            Loading meetings...
          </div>
        )}
        {!folderMeetingsLoading[id] && meetings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border-soft bg-white p-8 text-center text-sm text-text-secondary">
            No meetings in this folder.
          </div>
        )}
        {meetings.map((meeting) => (
          <div key={meeting.id} className="flex items-center gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm transition hover:border-primary hover:shadow-md">
            <Link to={`/meeting/${meeting.id}`} className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-text-primary">{meeting.title}</span>
              <span className="mt-1 block text-xs text-text-secondary">{meeting.dateLabel}</span>
            </Link>
            <button
              type="button"
              onClick={() => removeMeeting(meeting.id)}
              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
              aria-label={`Remove ${meeting.title} from folder`}
            >
              <FolderMinus size={19} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Communication
