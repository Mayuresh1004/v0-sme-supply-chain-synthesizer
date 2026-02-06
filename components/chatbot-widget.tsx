"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Shape for a single chat message */
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

/** Pre-built quick-action suggestions */
const QUICK_ACTIONS = [
  "Show low-stock items",
  "Top vendors by score",
  "Demand forecast summary",
  "Recent audit log",
]

/** Simulated bot responses keyed by keyword matches */
const BOT_RESPONSES: { pattern: RegExp; reply: string }[] = [
  {
    pattern: /low.?stock/i,
    reply:
      "You currently have 12 items below their reorder threshold. The most critical are: Wireless Mouse (3 units), USB-C Hub (5 units), and LED Monitor (7 units). Would you like me to generate a reorder recommendation?",
  },
  {
    pattern: /vendor|supplier/i,
    reply:
      "Your top 3 vendors by AI score are: TechParts Global (92/100), CircuitBoard Co (87/100), and FastShip Logistics (84/100). On-time delivery across all vendors averages 91.2% this month.",
  },
  {
    pattern: /forecast|demand/i,
    reply:
      "The 30-day demand forecast shows an expected 18% increase in electronics accessories. Recommended actions: increase Wireless Mouse stock by 150 units, and USB-C Hubs by 80 units to meet projected demand.",
  },
  {
    pattern: /audit|blockchain|log/i,
    reply:
      "The last 24 hours show 47 verified transactions on the audit chain. All hashes are valid with zero integrity warnings. The most recent entry is a Purchase order (PO-2026-0847) timestamped 14 minutes ago.",
  },
  {
    pattern: /hello|hi|hey/i,
    reply:
      "Hello! I'm the AIO5 Supply-Chain Assistant. I can help you with inventory status, vendor performance, demand forecasts, and audit logs. What would you like to know?",
  },
  {
    pattern: /reorder/i,
    reply:
      "Based on current stock levels and the 30-day forecast, I recommend reordering 8 SKUs. The total estimated reorder cost is $12,450. Shall I break it down by category?",
  },
]

const FALLBACK_REPLY =
  "I can help with inventory levels, vendor scores, demand forecasts, and audit logs. Try asking about low-stock items or vendor performance!"

function getAssistantReply(userMessage: string): string {
  for (const { pattern, reply } of BOT_RESPONSES) {
    if (pattern.test(userMessage)) return reply
  }
  return FALLBACK_REPLY
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to AIO5 Assistant! I can help you with inventory, vendors, forecasts, and audit data. How can I help you today?",
  timestamp: new Date(),
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /** Scroll to the latest message whenever messages change */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  /** Focus input when the panel opens */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  /** Send a message and get a simulated bot reply */
  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setIsTyping(true)

      // Simulate assistant "thinking" delay
      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: getAssistantReply(trimmed),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMsg])
        setIsTyping(false)
      }, 900 + Math.random() * 600)
    },
    [isTyping],
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* ---------- Chat panel ---------- */}
      <div
        className={cn(
          "fixed bottom-20 right-6 z-50 flex w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300",
          isOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
        style={{ height: "min(520px, calc(100vh - 120px))" }}
        role="dialog"
        aria-label="AIO5 Chat Assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-primary-foreground">
                AIO5 Assistant
              </p>
              <p className="mt-0.5 text-xs text-primary-foreground/70">
                Supply-chain AI helper
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="flex flex-col gap-3 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    msg.role === "assistant"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "assistant"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-muted px-4 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick actions (shown only when there are few messages) */}
        {messages.length <= 2 && !isTyping && (
          <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2.5">
            {QUICK_ACTIONS.map((action) => (
              <Badge
                key={action}
                variant="secondary"
                className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                onClick={() => sendMessage(action)}
              >
                {action}
              </Badge>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about inventory, vendors..."
            className="flex-1 bg-transparent px-1 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            disabled={isTyping}
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ---------- Floating action button ---------- */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isOpen
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground",
        )}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5" />
        )}
      </button>
    </>
  )
}
