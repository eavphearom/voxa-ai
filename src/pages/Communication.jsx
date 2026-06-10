import { Folder } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { communicationItems } from '../data/mockData'

function Communication() {
  const { id } = useParams()
  const item = communicationItems.find((entry) => entry.id === id) || communicationItems[0]

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-primary">
          <Folder size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{item.label}</h1>
          <p className="text-sm text-text-secondary">Static folder page from sidebar data.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3">
        {(item.children.length ? item.children : [{ id: item.id, label: `${item.label} notes`, path: '/meeting/daily-standup' }]).map((child) => (
          <Link key={child.id} to={child.path} className="rounded-2xl border border-border-soft bg-white p-4 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-[#EAFBF3] hover:shadow-md">
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Communication
