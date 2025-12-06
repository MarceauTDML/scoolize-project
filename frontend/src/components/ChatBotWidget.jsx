import { useState, useRef, useEffect } from "react";

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Comment puis-je vous aider ?", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: "Je suis un assistant virtuel. Je ne suis pas encore connecté à l'API.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <h4 style={styles.headerTitle}>Assistant Virtuel</h4>
            <button style={styles.closeButton} onClick={toggleChat}>
              ×
            </button>
          </div>

          <div style={styles.messagesList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.messageBubble,
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    msg.sender === "user" ? "#007bff" : "#f1f0f0",
                  color: msg.sender === "user" ? "#fff" : "#333",
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form style={styles.inputArea} onSubmit={handleSendMessage}>
            <input
              type="text"
              style={styles.input}
              placeholder="Écrivez votre message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" style={styles.sendButton}>
              ➤
            </button>
          </form>
        </div>
      )}

      <button style={styles.launcher} onClick={toggleChat}>
        {isOpen ? "▼" : "💬"}
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    fontFamily: "Arial, sans-serif",
  },
  launcher: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatWindow: {
    width: "300px",
    height: "400px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    margin: 0,
    fontSize: "1rem",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "20px",
    cursor: "pointer",
  },
  messagesList: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  messageBubble: {
    padding: "8px 12px",
    borderRadius: "15px",
    maxWidth: "80%",
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
  inputArea: {
    display: "flex",
    borderTop: "1px solid #eee",
    padding: "10px",
  },
  input: {
    flex: 1,
    border: "1px solid #ddd",
    borderRadius: "20px",
    padding: "8px 12px",
    outline: "none",
  },
  sendButton: {
    background: "none",
    border: "none",
    marginLeft: "10px",
    cursor: "pointer",
    color: "#007bff",
    fontSize: "1.2rem",
  },
};

export default ChatBotWidget;
