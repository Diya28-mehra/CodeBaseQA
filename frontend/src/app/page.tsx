'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import ChatInterface from '@/components/ChatInterface'
import ProofViewer from '@/components/ProofViewer'
import IngestionPanel from '@/components/IngestionPanel'
import { PanelLeftClose, PanelLeftOpen, Database, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface Proof {
  file_path: string
  start_line: number
  end_line: number
  content: string
}

interface Session {
  id: string
  query: string
  answer: string
  proof: Proof[]
  created_at: string
}

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null)
  const [showIngestion, setShowIngestion] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<Session[]>([])

  const handleSelectSession = (session: Session) => {
    setSelectedHistory([session])
    setSelectedProof(null)
  }

  return (
    <main className="flex h-screen w-full bg-[#030712] overflow-hidden text-slate-200">
      {/* Sidebar - Fixed width */}
      <Sidebar
        onSelectSession={handleSelectSession}
        activeSessionId={selectedHistory[0]?.id}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 relative bg-[#030712] overflow-hidden">
        {/* Header - Fixed Height */}
        <header className="h-16 flex-none border-b border-white/10 flex items-center justify-between px-6 bg-[#030712]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <div className="flex items-center gap-2 ml-2">
              <Database size={18} className="text-primary" />
              <span className="font-bold tracking-tight text-white">Codebase Intelligence</span>
            </div>
          </div>

          <button
            onClick={() => setShowIngestion(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Sparkles size={16} />
            Ingest Codebase
          </button>
        </header>

        {/* Chat Area - Rock Solid Fill */}
        <div className="flex-1 min-h-0 relative">
          <ChatInterface
            onShowProof={setSelectedProof}
            initialHistory={selectedHistory}
          />
        </div>

        {/* Modals & Overlays */}
        <AnimatePresence>
          {showIngestion && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0b0f1a] border border-white/10 rounded-3xl shadow-2xl relative max-w-lg w-full"
              >
                <button
                  onClick={() => setShowIngestion(false)}
                  className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white"
                >
                  <X size={20} />
                </button>
                <IngestionPanel onComplete={() => setShowIngestion(false)} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedProof && (
            <ProofViewer
              proof={selectedProof}
              onClose={() => setSelectedProof(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
