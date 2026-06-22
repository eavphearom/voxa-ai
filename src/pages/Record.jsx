import { AlertCircle, ArrowLeft, CalendarDays, LoaderCircle, Share2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AudioPlayer from '../components/AudioPlayer'
import TranscriptView from '../components/TranscriptView'
import {
  extractMeetingPayload,
  finishMeetingRecording,
  getMeetingDetail,
  startMeetingRecording,
  uploadMeetingRecordingChunk,
} from '../services/authApi'

const chunkInterval = 5000
function Record() {
  const navigate = useNavigate()
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const meetingIdRef = useRef(null)
  const recordedChunksRef = useRef([])
  const chunkQueueRef = useRef(Promise.resolve())
  const chunkIndexRef = useRef(0)
  const transcriptEndRef = useRef(null)
  const stoppingRef = useRef(false)
  const [phase, setPhase] = useState('starting')
  const [meeting, setMeeting] = useState(null)
  const [transcriptParts, setTranscriptParts] = useState([])
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const beginRecording = useCallback(async (isCancelled = () => false) => {
    setError('')
    setPhase('starting')
    setTranscriptParts([])
    setSeconds(0)
    setPaused(false)
    recordedChunksRef.current = []
    chunkQueueRef.current = Promise.resolve()
    chunkIndexRef.current = 0
    stoppingRef.current = false

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error('Audio recording is not supported by this browser.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (isCancelled()) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      const response = await startMeetingRecording({
        title: `Recorded Meeting ${new Date().toLocaleString()}`,
        language: '',
      })
      const payload = extractMeetingPayload(response)
      const nextMeeting = payload.meeting
      if (!nextMeeting?.id) throw new Error('The recording API did not return a meeting ID.')
      if (isCancelled()) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      meetingIdRef.current = nextMeeting.id
      setMeeting(nextMeeting)

      const mimeType = getSupportedMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (!event.data?.size) return
        recordedChunksRef.current.push(event.data)
        if (stoppingRef.current) return

        const currentIndex = chunkIndexRef.current
        chunkIndexRef.current += 1
        chunkQueueRef.current = chunkQueueRef.current
          .then(() => uploadMeetingRecordingChunk(nextMeeting.id, event.data, currentIndex))
          .then((chunkResponse) => {
            const text = extractMeetingPayload(chunkResponse).text?.trim()
            if (text) setTranscriptParts((parts) => [...parts, text])
          })
          .catch((chunkError) => {
            console.error('Live recording chunk failed:', chunkError)
            setError(`Live transcript delayed: ${chunkError.message}`)
          })
      }

      recorder.start(chunkInterval)
      setPhase('recording')
    } catch (startError) {
      console.error('Start recording failed:', startError)
      stopTracks()
      setError(startError.message)
      setPhase('failed')
    }
  }, [stopTracks])

  useEffect(() => {
    let cancelled = false
    const startTimer = window.setTimeout(() => beginRecording(() => cancelled), 0)
    return () => {
      cancelled = true
      window.clearTimeout(startTimer)
      stoppingRef.current = true
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      stopTracks()
    }
  }, [beginRecording, stopTracks])

  useEffect(() => {
    if (phase !== 'recording' || paused) return undefined
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [paused, phase])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [transcriptParts])

  useEffect(() => {
    if (phase !== 'processing' || !meeting?.id) return undefined
    let cancelled = false

    const poll = async () => {
      try {
        const response = await getMeetingDetail(meeting.id)
        const payload = extractMeetingPayload(response)
        if (cancelled) return
        setMeeting(payload.meeting)
        const status = payload.meeting?.status
        if (status === 'completed') navigate(`/meeting/${meeting.id}`, { replace: true })
        if (status === 'failed') {
          setError('Meeting processing failed. You can retry checking its status.')
          setPhase('failed-processing')
        }
      } catch (pollError) {
        if (!cancelled) setError(`Status check failed: ${pollError.message}`)
      }
    }

    poll()
    const timer = window.setInterval(poll, 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [meeting?.id, navigate, phase])

  const togglePause = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    if (recorder.state === 'recording') {
      recorder.pause()
      setPaused(true)
    } else if (recorder.state === 'paused') {
      recorder.resume()
      setPaused(false)
    }
  }

  const finishRecording = async () => {
    const recorder = mediaRecorderRef.current
    const meetingId = meetingIdRef.current
    if (!recorder || !meetingId || stoppingRef.current) return

    stoppingRef.current = true
    setPhase('finishing')
    setError('')

    try {
      await stopRecorder(recorder)
      stopTracks()
      await chunkQueueRef.current

      const mimeType = recorder.mimeType || recordedChunksRef.current[0]?.type || 'audio/webm'
      const completeRecording = new Blob(recordedChunksRef.current, { type: mimeType })
      if (!completeRecording.size) throw new Error('The recording is empty. Please try again.')

      const response = await finishMeetingRecording(meetingId, completeRecording, setUploadProgress)
      const payload = extractMeetingPayload(response)
      setMeeting(payload.meeting || meeting)
      setPhase('processing')
    } catch (finishError) {
      console.error('Finish recording failed:', finishError)
      setError(finishError.message)
      setPhase('failed')
      stoppingRef.current = false
    }
  }

  const retryProcessing = () => {
    setError('')
    setPhase('processing')
  }

  const time = formatTime(seconds)
  const transcript = transcriptParts.length ? `Live transcript:\n${transcriptParts.join(' ')}` : ''
  const processing = phase === 'processing' || phase === 'finishing'

  return (
    <div className="min-h-screen animate-fade-in">
      <section className="relative flex h-screen min-h-0 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-border-soft px-5 md:px-10">
          <Link to="/" className="rounded-full bg-slate-100 p-3 hover:bg-slate-200" aria-label="Back to home">
            <ArrowLeft size={20} />
          </Link>
          <button type="button" onClick={() => navigator.clipboard.writeText(window.location.href)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
            <Share2 size={17} /> Share
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 pb-28 md:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">{meeting?.title || 'Starting recording...'}</h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-text-secondary"><CalendarDays size={16} />{new Date().toLocaleString()}</p>
              </div>
              {phase === 'recording' && (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500">
                  <span className={`h-2 w-2 rounded-full bg-red-500 ${paused ? '' : 'animate-pulse'}`} />
                  {paused ? 'Paused' : 'Recording'} {time}
                </span>
              )}
            </div>

            {processing ? (
              <ProcessingState status={phase === 'finishing' ? 'uploading' : meeting?.status} progress={uploadProgress} />
            ) : (
              <div className="mt-8 rounded-2xl border border-border-soft bg-white p-5 sm:p-7">
                <div className="mb-6 flex items-center justify-between border-b border-border-soft pb-4">
                  <h2 className="font-semibold text-text-primary">Live transcript</h2>
                  {phase === 'recording' && <span className="text-xs font-medium text-primary">Listening...</span>}
                </div>
                <TranscriptView transcript={transcript} emptyMessage={phase === 'starting' ? 'Requesting microphone access...' : 'Start speaking to see the transcript.'} />
                <div ref={transcriptEndRef} />
              </div>
            )}

            {error && (
              <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <span className="flex gap-2"><AlertCircle className="mt-0.5 shrink-0" size={17} />{error}</span>
                {(phase === 'failed' || phase === 'failed-processing') && (
                  <button type="button" onClick={phase === 'failed-processing' ? retryProcessing : () => beginRecording()} className="shrink-0 font-semibold underline">
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {phase === 'recording' && (
          <div className="shrink-0 border-t border-border-soft bg-white p-3 md:px-10">
            <AudioPlayer recording paused={paused} elapsed={time} onPause={togglePause} onStop={finishRecording} />
          </div>
        )}
      </section>
    </div>
  )
}

function ProcessingState({ status, progress }) {
  const labels = {
    uploading: 'Uploading complete recording...',
    processing: 'Processing meeting...',
    uploaded: 'Preparing meeting...',
    transcribing: 'Transcribing audio...',
    analyzing: 'Detecting speakers...',
  }
  return (
    <div className="mt-10 rounded-2xl border border-border-soft bg-white p-8 text-center">
      <LoaderCircle className="mx-auto animate-spin text-primary" size={34} />
      <h2 className="mt-4 text-lg font-semibold text-text-primary">{labels[status] || 'Processing meeting...'}</h2>
      <p className="mt-2 text-sm text-text-secondary">This page will open the completed transcript automatically.</p>
      {status === 'uploading' && (
        <div className="mx-auto mt-5 max-w-sm">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="mt-2 text-xs font-semibold text-text-secondary">{progress}%</p>
        </div>
      )}
    </div>
  )
}

function stopRecorder(recorder) {
  return new Promise((resolve) => {
    recorder.addEventListener('stop', resolve, { once: true })
    recorder.stop()
  })
}

function getSupportedMimeType() {
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
    .find((type) => MediaRecorder.isTypeSupported(type)) || ''
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export default Record
