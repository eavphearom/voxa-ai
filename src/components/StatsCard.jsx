import { FileText, Languages, MessageSquareText, Sparkles } from 'lucide-react'

const icons = {
  FileText,
  MessageSquareText,
  Languages,
  Sparkles,
}

function StatsCard({ stat }) {
  const Icon = icons[stat.icon] || Sparkles

  return (
    <article className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAFBF3] text-primary">
        <Icon size={21} />
      </div>
      <p className="text-3xl font-semibold text-text-primary">{stat.value}</p>
      <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
    </article>
  )
}

export default StatsCard
