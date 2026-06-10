import { Link, useParams } from 'react-router-dom'
import MeetingCard from '../components/MeetingCard'
import { getMeetingById, getRecentById } from '../data/mockData'

function History() {
  const { id } = useParams()
  const history = getRecentById(id)
  const meeting = getMeetingById(history.meetingId)

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 animate-fade-in">
      <p className="text-sm font-semibold text-primary">Recent</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary">{history.label || history.title}</h1>
      <p className="mt-2 text-sm text-text-secondary">Static history page linked from the sidebar menu.</p>

      <div className="mt-8">
        <MeetingCard meeting={meeting} />
      </div>

      <Link to={`/meeting/${meeting.id}`} className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-[#25A86A]">
        Open Meeting
      </Link>
    </div>
  )
}

export default History
