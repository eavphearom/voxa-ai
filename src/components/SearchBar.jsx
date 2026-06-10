import { Search } from 'lucide-react'

function SearchBar({ value, onChange, placeholder = 'Search meetings' }) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-full bg-slate-100 pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-primary/15"
        placeholder={placeholder}
      />
    </div>
  )
}

export default SearchBar
