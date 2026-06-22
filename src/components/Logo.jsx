function Logo({ compact = false, className = '' }) {
  return (
    <img
      src={compact ? '/images/logo1.png' : '/images/logo2.png'}
      alt="VOXA AI"
      className={`${compact ? 'h-10 w-12 rounded-lg object-contain' : 'h-10 w-auto max-w-[180px] object-contain'} ${className}`}
    />
  )
}

export default Logo
