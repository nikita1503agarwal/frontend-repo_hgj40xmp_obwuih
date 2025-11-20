import { useState } from 'react'

export default function JoinExam({ onJoin }) {
  const [examId, setExamId] = useState('demo-exam-1')
  const [userId, setUserId] = useState('student-001')
  const [name, setName] = useState('Alex Student')

  const handleJoin = (e) => {
    e.preventDefault()
    if (!examId || !userId) return
    onJoin({ examId, userId, name })
  }

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300 mb-1">Exam ID</label>
        <input value={examId} onChange={(e)=>setExamId(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800/70 border border-slate-700 text-white" placeholder="exam-123" />
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">User ID</label>
        <input value={userId} onChange={(e)=>setUserId(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800/70 border border-slate-700 text-white" placeholder="user-abc" />
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">Name</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800/70 border border-slate-700 text-white" placeholder="Your Name" />
      </div>
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition-colors">Join Exam</button>
    </form>
  )
}
