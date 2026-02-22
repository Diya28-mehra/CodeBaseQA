'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { Github, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function IngestionPanel({ onComplete }: { onComplete: () => void }) {
    const [githubUrl, setGithubUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)

    const handleIngest = async () => {
        setLoading(true)
        setStatus(null)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            await axios.post(`${apiUrl}/ingest/github`, { url: githubUrl })
            setStatus({ type: 'success', msg: 'Codebase ingested successfully! Vectors created.' })
            setTimeout(onComplete, 2000)
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.detail || 'Ingestion failed' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-xl w-full">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/5">
                    <Github size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white">GitHub Ingestion</h2>
                <p className="text-slate-500 text-sm mt-1">Apna repository URL daaliye intelligence build karne ke liye</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold px-1">Repo URL</label>
                    <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/user/repo"
                        className="w-full glass py-4 px-6 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all shadow-inner"
                    />
                </div>

                <button
                    onClick={handleIngest}
                    disabled={loading || !githubUrl}
                    className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-800 text-white py-5 rounded-2xl transition-all font-black text-lg shadow-xl shadow-primary/10 disabled:shadow-none flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" /> Ingesting Intelligence...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} /> Start Ingestion
                        </>
                    )}
                </button>

                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                                "p-4 rounded-xl flex items-start gap-4 border",
                                status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                            )}
                        >
                            {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                            <p className="text-sm font-medium">{status.msg}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
