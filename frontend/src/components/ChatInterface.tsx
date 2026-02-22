'use client'

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, User, Bot, Code, Terminal, Sparkles, ExternalLink, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
    id: string
    role: 'user' | 'bot'
    text: string
    proof?: any[]
}

// --- Senior Developer Polish: Sub-Components (Outside for performance) ---

const ConfidenceBadge = ({ score }: { score: string }) => {
    const isHigh = score.toLowerCase().includes('high')
    const isMedium = score.toLowerCase().includes('medium')

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4",
            isHigh ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                isMedium ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-rose-500/10 text-rose-400 border border-rose-500/20"
        )}>
            <ShieldCheck size={12} />
            Confidence: {score}
        </div>
    )
}

const FileTag = ({ file, onClick }: { file: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[11px] text-slate-300 font-medium hover:bg-white/10 hover:border-primary/30 transition-all group"
    >
        <div className="w-5 h-5 bg-white/5 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
            <Code size={12} />
        </div>
        <span className="truncate max-w-[150px]">{file}</span>
    </button>
)

const BotResponse = ({ text, proof, onShowProof }: { text: string, proof?: any[], onShowProof: (p: any) => void }) => {
    const [isEvidenceOpen, setIsEvidenceOpen] = useState(false)

    // Parse Confidence
    const confidenceRegex = /\*\*Confidence\*\*:\s*([^-]+)\s*-\s*(.*)/i
    const confidenceMatch = text.match(confidenceRegex)
    const confidenceScore = confidenceMatch ? confidenceMatch[1].trim() : null

    // Parse Sections
    const parts = text.split('--- EVIDENCE ---')
    const mainBody = parts[0]
        .replace(confidenceRegex, '') // Remove confidence from body
        .replace(/\*\*Answer\*\*:\s*/gi, '') // Remove redundant labels
        .trim()

    return (
        <div className="space-y-4">
            {confidenceScore && <ConfidenceBadge score={confidenceScore} />}

            <div className="prose prose-invert prose-sm max-w-none text-slate-200">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-white/10 px-1 rounded text-primary-hover font-mono" {...props} />,
                        pre: ({ node, ...props }) => <pre className="bg-black/50 p-4 rounded-2xl overflow-x-auto border border-white/5 mb-4" {...props} />,
                    }}
                >
                    {mainBody}
                </ReactMarkdown>
            </div>

            {/* Collapsible Evidence Section */}
            {proof && proof.length > 0 && (
                <div className="mt-6 border-t border-white/5 pt-4">
                    <button
                        onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
                        className="flex items-center justify-between w-full group py-2"
                    >
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                            <ExternalLink size={14} />
                            Technical Evidence
                        </div>
                        {isEvidenceOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </button>

                    <AnimatePresence>
                        {isEvidenceOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 pb-2">
                                    {proof.map((p, i) => (
                                        <FileTag
                                            key={i}
                                            file={`${p.file_path.split('/').pop()} (L${p.start_line}-${p.end_line})`}
                                            onClick={() => onShowProof(p)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

// --- Main Component ---

export default function ChatInterface({
    onShowProof,
    initialHistory = []
}: {
    onShowProof: (proof: any) => void
    initialHistory?: any[]
}) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (initialHistory.length > 0) {
            const formatted = [
                { id: 'h1', role: 'user', text: initialHistory[0].query },
                { id: 'h2', role: 'bot', text: initialHistory[0].answer, proof: initialHistory[0].proof }
            ] as Message[]
            setMessages(formatted)
        }
    }, [initialHistory])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await axios.post(`${apiUrl}/ask`, { query: input })
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: res.data.answer,
                proof: res.data.proof
            }
            setMessages(prev => [...prev, botMsg])
        } catch (err) {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: "API Error: Background service not responding. Check your connection or Groq API Key."
            }
            setMessages(prev => [...prev, botMsg])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="h-full flex flex-col w-full max-w-5xl mx-auto border-x border-white/10 bg-black/20 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <AnimatePresence>
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-10">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                                <Terminal size={40} />
                            </div>
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                                Ask your Codebase
                            </h1>
                            <p className="text-slate-500 max-w-sm">
                                Deep technical insights with verifiable proof. Enter a query to explore the project.
                            </p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={m.id}
                            className={cn(
                                "flex gap-4",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {m.role === 'bot' && (
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                                    <Bot size={24} />
                                </div>
                            )}

                            <div className={cn(
                                "max-w-[85%]", // Slightly wider for senior feel
                                m.role === 'user' ? "text-right" : "text-left"
                            )}>
                                <div className={cn(
                                    "p-6 rounded-3xl text-sm transition-all",
                                    m.role === 'user'
                                        ? "bg-primary text-white rounded-tr-none shadow-xl shadow-primary/20"
                                        : "bg-[#0f172a]/70 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md"
                                )}>
                                    {m.role === 'bot' ? (
                                        <BotResponse text={m.text} proof={m.proof} onShowProof={onShowProof} />
                                    ) : (
                                        <p className="whitespace-pre-wrap">{m.text}</p>
                                    )}
                                </div>
                            </div>

                            {m.role === 'user' && (
                                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/20">
                                    <User size={24} />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                                <Sparkles size={20} />
                            </div>
                            <div className="bg-white/5 px-6 py-4 rounded-3xl rounded-tl-none text-slate-500 text-sm italic">
                                Thinking...
                            </div>
                        </div>
                    )}
                </AnimatePresence>
                <div ref={scrollRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-[#030712] border-t border-white/10">
                <div className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Puchiye apne code se..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 pr-16 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="absolute right-2.5 top-2.5 bottom-2.5 px-5 bg-primary hover:bg-primary-hover disabled:bg-slate-800 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}
