function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const text = message.message || message.text

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          isUser
            ? 'max-w-[76%] rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-text-primary'
            : 'max-w-3xl text-sm leading-7 text-text-primary'
        }
      >
        {text}
      </div>
    </div>
  )
}

export default ChatMessage
