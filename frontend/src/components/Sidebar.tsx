'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { MessageSquare, Clock, Plus, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Session {
    id: string
    query: string
    created_at: string
}

export default function Sidebar({
    onSelectSession,
    activeSessionId,
    isCollapsed
}: {
    onSelectSession: (session: Session) => void
    activeSessionId?: string
    isCollapsed: boolean
}) {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const res = await axios.get(`${apiUrl}/history`)
                setSessions(res.data)
            } catch (err) {
                console.error('Failed to fetch history', err)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    return (
        <div
            className={cn(
                "h-screen glass border-r flex flex-col transition-all duration-300",
                isCollapsed ? "w-0 overflow-hidden border-none" : "w-80"
            )}
        >
            <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    History
                </h2>
                <button
                    onClick={() => window.location.reload()}
                    className="p-2 glass-hover rounded-full text-primary"
                    title="New Chat"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {loading ? (
                    <div className="space-y-3 p-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm italic">
                        No history yet
                    </div>
                ) : (
                    sessions.map((session, i) => (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={session.id}
                            onClick={() => onSelectSession(session)}
                            className={cn(
                                "w-full p-4 rounded-xl text-left flex items-start gap-4 transition-all group relative",
                                activeSessionId === session.id
                                    ? "bg-primary/20 border border-primary/30"
                                    : "glass-hover border border-white/5"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg",
                                activeSessionId === session.id ? "bg-primary text-white" : "bg-white/5 text-slate-400"
                            )}>
                                <MessageSquare size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-slate-200">
                                    {session.query}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock size={12} className="text-slate-500" />
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                                        {new Date(session.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight
                                size={14}
                                className={cn(
                                    "mt-1 text-slate-600 group-hover:text-primary transition-colors",
                                    activeSessionId === session.id && "text-primary"
                                )}
                            />
                        </motion.button>
                    ))
                )}
            </div>

            <div className="p-4 border-t bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent animate-pulse-slow" />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-semibold text-slate-300">CodebaseBot v1.0</p>
                        <p className="text-[10px] text-primary truncate">System Online</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
