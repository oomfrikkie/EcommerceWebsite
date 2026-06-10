import { useState, useRef, useEffect } from "react"
import "./chat.css"
import axios from "axios"

interface Message {
  text: string
  sender: "user" | "bot"
}

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    const userMessage = message
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }])
    setMessage("")
    setLoading(true)

    try {
      const accountId = sessionStorage.getItem("account_id")
      const res = await axios.post("http://localhost:3000/chat", {
        message: userMessage,
        accountId: accountId ? parseInt(accountId, 10) : undefined,
      })

      setMessages((prev) => [...prev, { text: res.data.response, sender: "bot" }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I couldn't process your request. Please try again.", sender: "bot" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      sendMessage()
    }
  }

  return (
    <div className="chat-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Shop Assistant</span>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="placeholder">
                Hi! I can help with orders and products. Try asking:
                <br /><br />
                "Status of order 123"<br />
                "My orders"<br />
                "Do you sell headphones?"
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.sender}`}>
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.text.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              ))
            )}
            {loading && <div className="message bot loading">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask about your orders..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  )
}