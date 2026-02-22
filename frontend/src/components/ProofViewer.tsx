'use client'

import React from 'react'
import { X, FileCode, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface Proof {
    file_path: string
    start_line: number
    end_line: number
    content: string
}

export default function ProofViewer({
    proof,
    onClose
}: {
    proof: Proof
    onClose: () => void
}) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(proof.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[600px] glass border-l shadow-2xl z-50 flex flex-col"
        >
            <div className="p-6 border-b flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                        <FileCode size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white truncate max-w-[300px]">
                            {proof.file_path.split('/').pop()}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                            Lines {proof.start_line} - {proof.end_line}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-3 glass-hover rounded-xl text-slate-400 hover:text-white transition-all"
                        title="Copy Code"
                    >
                        {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-3 glass-hover rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="p-4 bg-black/40 border-b flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2">File Path</span>
                <code className="text-[11px] text-primary/80 truncate">{proof.file_path}</code>
            </div>

            <div className="flex-1 overflow-auto bg-[#0a0a0a] p-0 font-mono text-sm relative">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/5 to-transparent h-20" />

                <table className="w-full border-collapse">
                    <tbody>
                        {proof.content.split('\n').map((line: string, i: number) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                <td className="w-12 text-right pr-4 text-slate-700 select-none border-r border-white/5 bg-black/20 text-[10px]">
                                    {proof.start_line + i}
                                </td>
                                <td className="pl-6 py-0.5 text-slate-300 font-mono whitespace-pre">
                                    {line}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 border-t bg-white/5">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 italic">
                        * This snippet was retrieved via vector similarity search.
                    </p>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Verified Source</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
