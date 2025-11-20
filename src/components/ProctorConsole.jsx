import { useEffect, useRef, useState } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function ProctorConsole({ session, onLeave }) {
  const videoRef = useRef(null)
  const [events, setEvents] = useState([])
  const [permissionError, setPermissionError] = useState('')
  const [visible, setVisible] = useState(true)

  // Tab focus/blur detection
  useEffect(() => {
    const handleVisibility = () => {
      const type = document.hidden ? 'tab_blur' : 'tab_focus'
      sendEvent(type, document.hidden ? 'medium' : 'low', { hidden: document.hidden })
      setVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Get webcam stream
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (e) {
        setPermissionError(e.message)
      }
    }
    start()
  }, [])

  const sendEvent = async (event_type, severity = 'low', data = {}) => {
    const payload = {
      exam_id: session.examId,
      user_id: session.userId,
      event_type,
      severity,
      data,
    }
    setEvents((prev) => [{ ...payload, timestamp: new Date().toISOString() }, ...prev])
    try {
      await fetch(`${baseUrl}/api/proctor/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      // ignore for demo
    }
  }

  // Periodic frame snapshot (mock ML)
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const canvas = document.createElement('canvas')
        const video = videoRef.current
        if (!video || video.readyState < 2) return
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)
        const image_b64 = canvas.toDataURL('image/jpeg')
        const res = await fetch(`${baseUrl}/api/ml/analyze-frame`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exam_id: session.examId, user_id: session.userId, image_b64 }),
        })
        const result = await res.json()
        if (result.phone_detected) {
          sendEvent('phone_detected', 'medium')
        }
        if (result.gaze_anomaly) {
          sendEvent('gaze_anomaly', 'low')
        }
      } catch (e) {
        // ignore in demo
      }
    }, 7000)
    return () => clearInterval(id)
  }, [session.examId, session.userId])

  const [summary, setSummary] = useState(null)
  const refreshSummary = async () => {
    const url = new URL(`${baseUrl}/api/proctor/summary`)
    url.searchParams.set('exam_id', session.examId)
    url.searchParams.set('user_id', session.userId)
    const res = await fetch(url)
    const data = await res.json()
    setSummary(data)
  }

  useEffect(() => {
    const id = setInterval(refreshSummary, 5000)
    refreshSummary()
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300 text-sm">Exam</p>
          <p className="text-white font-semibold">{session.examId}</p>
        </div>
        <button onClick={onLeave} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-500">Leave Exam</button>
      </div>

      {permissionError && (
        <div className="p-3 rounded bg-red-500/20 border border-red-500 text-red-200 text-sm">Camera error: {permissionError}</div>
      )}

      <div className={`rounded-xl overflow-hidden border ${visible ? 'border-emerald-500/30' : 'border-yellow-500/30'} bg-slate-900`}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">Recent Events</h3>
          <div className="h-48 overflow-auto space-y-2">
            {events.length === 0 ? (
              <p className="text-slate-400 text-sm">No events yet</p>
            ) : (
              events.map((e, idx) => (
                <div key={idx} className="text-slate-200 text-sm bg-slate-900/60 rounded p-2 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs opacity-70">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-700 uppercase">{e.event_type}</span>
                  </div>
                  {e.data && <pre className="text-xs opacity-80 mt-1">{JSON.stringify(e.data)}</pre>}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">Suspicion Summary</h3>
          {!summary ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : (
            <div className="text-slate-200 text-sm space-y-2">
              <p>Total events: <span className="font-semibold">{summary.total_events}</span></p>
              <p>Suspicion score: <span className="font-semibold">{summary.suspicion_score}</span> (<span className="uppercase">{summary.suspicion_level}</span>)</p>
              <div>
                <p className="font-semibold mb-1">Counts</p>
                <pre className="text-xs bg-slate-900/60 border border-slate-700 rounded p-2">{JSON.stringify(summary.counts, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => sendEvent('tab_blur', 'medium')} className="px-3 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-500">Simulate Tab Blur</button>
        <button onClick={() => sendEvent('multi_face', 'high')} className="px-3 py-2 rounded bg-pink-600 text-white hover:bg-pink-500">Simulate Multi-face</button>
        <button onClick={() => sendEvent('screen_share', 'high')} className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500">Simulate Screen Share</button>
      </div>
    </div>
  )
}
