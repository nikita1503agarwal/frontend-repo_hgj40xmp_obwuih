import { useState } from 'react'
import JoinExam from './components/JoinExam'
import ProctorConsole from './components/ProctorConsole'

function App() {
  const [session, setSession] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {!session ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-white">Online Exam Proctoring Portal</h1>
                <p className="text-blue-200/80 mt-2">Join an exam and experience live, privacy-aware proctoring with tab detection and mock ML analysis.</p>
              </div>
              <JoinExam onJoin={(s)=>setSession(s)} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-6">
                <h2 className="text-white text-2xl font-semibold mb-2">Live Proctoring</h2>
                <p className="text-slate-300 text-sm mb-4">Webcam preview, tab monitoring, and event summaries are captured locally and sent to the server.</p>
                <ProctorConsole session={session} onLeave={()=>setSession(null)} />
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <a href="/test" className="text-sm text-blue-300/80 hover:text-blue-200 underline">Backend connectivity check</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
