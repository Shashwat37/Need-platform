/**
 * ChatbotWidget.jsx — Floating interactive AI Chatbot Assistant ("NEED Mitra").
 *
 * WHAT: Provides floating AI Assistant widget for service recommendations, 90/10 split explanation,
 *       emergency rush guidance, and quick booking triggers.
 * WHY:  Assists customers and workers instantly on any page without navigating away.
 * HOW:  Calls sendChatMessage() from api.js and renders markdown-friendly messages & action buttons.
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react'
import { sendChatMessage } from '../services/api'
import BookingModal from './BookingModal'

const INITIAL_PROMPTS = [
  'Need an Electrician for wiring',
  'How does 90/10 split work?',
  'Emergency water pipe leak!',
  'How to verify worker identity?',
]

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! 🙏 I am **NEED Mitra**, your AI Assistant. How can I help you today?',
      quick_actions: [
        { label: 'Book Electrician', action: 'book', service_id: 1 },
        { label: 'How 90/10 Works', link: '/about' },
        { label: 'Help Desk', link: '/support' },
      ],
    },
  ])

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  // Booking Modal integration
  const [bookingModal, setBookingModal] = useState({ isOpen: false, serviceId: null })

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [isOpen, messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleSend(textToSend) {
    const query = (textToSend || input).trim()
    if (!query || sending) return

    const userMsg = { sender: 'user', text: query }
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setSending(true)

    try {
      const res = await sendChatMessage(query)
      const botMsg = {
        sender: 'bot',
        text: res.reply || 'I am here to help!',
        quick_actions: res.quick_actions || [],
        suggested_services: res.suggested_services || [],
      }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Apologies, I encountered a temporary connection glitch. Please try again or visit our Help Center.',
          quick_actions: [{ label: 'Go to Help Center', link: '/support' }],
        },
      ])
    } finally {
      setSending(false)
    }
  }

  function handleActionClick(action) {
    if (action.action === 'book' && action.service_id) {
      setBookingModal({ isOpen: true, serviceId: action.service_id })
    } else if (action.link) {
      navigate(action.link)
      setIsOpen(false)
    }
  }

  function renderFormattedText(text) {
    // Simple markdown-style renderer for bold (**text**) and linebreaks
    const parts = text.split(/(\*\*.*?\*\*|\n)/g)
    return parts.map((part, idx) => {
      if (part === '\n') return <br key={idx} />
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-ink">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full bg-brand-600 px-4 py-3 text-white shadow-xl hover:bg-brand-700 hover:scale-105 transition-all duration-200"
            aria-label="Open NEED Mitra AI Assistant"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <Bot size={20} className="shrink-0" />
            <span className="font-display text-xs font-bold tracking-wide">
              NEED Mitra AI
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm sm:max-w-md h-[540px] max-h-[85vh] rounded-2xl bg-white border border-line shadow-2xl flex flex-col overflow-hidden animate-fade-in">

          {/* Chat Header */}
          <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-display text-sm font-extrabold flex items-center gap-1.5">
                  NEED Mitra
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                    AI Assistant
                  </span>
                </h3>
                <p className="text-[11px] text-brand-100">NEED Cooperative Helpdesk</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-brand-100 hover:bg-white/10 hover:text-white transition"
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-paper/30 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700 font-bold mt-0.5">
                    <Bot size={14} />
                  </div>
                )}

                <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-xs space-y-2.5 ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-white text-ink border border-line rounded-tl-none'
                }`}>
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {renderFormattedText(m.text)}
                  </div>

                  {/* Action Buttons inside Bot message */}
                  {m.quick_actions && m.quick_actions.length > 0 && (
                    <div className="pt-1.5 flex flex-wrap gap-1.5 border-t border-line/60">
                      {m.quick_actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act)}
                          className="rounded-lg bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1 text-[11px] font-bold text-brand-700 transition"
                        >
                          {act.label} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-white font-bold text-[10px] mt-0.5">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex gap-2.5 items-center text-muted text-xs">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100 text-brand-700">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-line rounded-2xl px-3.5 py-2">
                  <Loader2 size={13} className="animate-spin text-brand-600" />
                  <span>NEED Mitra is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-3 py-2 bg-white border-t border-line overflow-x-auto flex gap-1.5 scrollbar-none">
            {INITIAL_PROMPTS.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap rounded-full bg-paper hover:bg-brand-50 border border-line hover:border-brand-200 px-2.5 py-1 text-[11px] font-medium text-muted hover:text-brand-700 transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 bg-white border-t border-line flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask NEED Mitra AI (e.g. Electrician in Noida)..."
              className="flex-1 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}

      {/* Embedded Booking Modal triggered from Chatbot action */}
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, serviceId: null })}
        serviceId={bookingModal.serviceId}
      />
    </>
  )
}
