import React, { useContext, useState } from 'react'
import { ChatContext } from '../../context/ChatContext'

const AIAssistPanel = ({ userId, groupId, onClose }) => {
    const { askAIAbout, summarizeConversation } = useContext(ChatContext)
    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleAsk = async (e) => {
        e.preventDefault()
        if (!question.trim()) return
        setLoading(true)
        setAnswer("")
        setError("")
        const reply = await askAIAbout(question.trim(), { userId, groupId })
        if (reply) setAnswer(reply)
        else setError("Something went wrong — try again.")
        setLoading(false)
    }

    const handleSummarize = async () => {
        setLoading(true)
        setAnswer("")
        setError("")
        const summary = await summarizeConversation({ userId, groupId })
        if (summary) setAnswer(summary)
        else setError("Something went wrong — try again.")
        setLoading(false)
    }

    return (
        <>
            <div className='fixed inset-0 z-30' onClick={onClose} />
            <div className='absolute top-full right-0 mt-2 z-40 w-[420px] max-w-[92vw] bg-[#282142] border border-gray-600 rounded-lg shadow-lg p-4 flex flex-col gap-3 text-white'>
                <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium'>Ask AI</p>
                    <button onClick={onClose} className='text-lg leading-none text-gray-400 hover:text-white'>&times;</button>
                </div>

                <button
                    onClick={handleSummarize}
                    disabled={loading}
                    className='text-left text-sm px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-50'
                >
                    📋 Summarize conversation
                </button>

                <form onSubmit={handleAsk} className='flex gap-2'>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask about this chat..."
                        className='flex-1 text-sm p-2 rounded-md bg-[#1a1533] border border-gray-600 outline-none'
                    />
                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className='px-3 py-2 rounded-md bg-gradient-to-r from-purple-400 to-violet-600 text-sm disabled:opacity-50'
                    >
                        Ask
                    </button>
                </form>

                {loading && <p className='text-xs text-gray-400'>Thinking...</p>}

                {error && (
                    <div className='text-sm text-red-300 bg-red-900/20 rounded-md p-3 flex items-center justify-between gap-2'>
                        <span>{error}</span>
                        <button
                            onClick={question.trim() ? handleAsk : handleSummarize}
                            className='text-xs underline shrink-0'
                        >
                            Retry
                        </button>
                    </div>
                )}

                {answer && (
                    <div className='text-sm bg-white/5 rounded-md p-3 max-h-72 overflow-y-auto whitespace-pre-wrap'>
                        {answer}
                    </div>
                )}
            </div>
        </>
    )
}

export default AIAssistPanel