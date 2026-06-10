import { CloudUpload, Mic } from 'lucide-react'
import { Link } from 'react-router-dom'
import DateFilter from './DateFilter'
import SearchBar from './SearchBar'

function TopBar({ search, onSearchChange, dateRange, onDateRangeChange, onImport }) {
  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <SearchBar value={search} onChange={onSearchChange} />

      <div className="flex flex-wrap items-end gap-3">
        <DateFilter value={dateRange} onChange={onDateRangeChange} />
        <button
          type="button"
          onClick={onImport}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-text-primary transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200"
        >
          <CloudUpload size={18} />
          Import
        </button>
        <Link
          to="/record"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#25A86A]"
        >
          <Mic size={17} />
          Record
        </Link>
      </div>
    </div>
  )
}

export default TopBar
