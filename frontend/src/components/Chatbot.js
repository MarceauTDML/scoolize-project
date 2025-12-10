import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/client";
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "model", text: "Bonjour ! Je suis l'assistant Scoolize. Une question sur votre orientation ?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    
    const newMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const historyForApi = newMessages.slice(0, -1).filter(msg => msg.text !== "Bonjour ! Je suis l'assistant Scoolize. Une question sur votre orientation ?");

      const data = await sendChatMessage(userMessage, historyForApi);
      
      setMessages(prev => [...prev, { role: "model", text: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "model", text: "Désolé, une erreur est survenue." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999, fontFamily: 'Arial, sans-serif' }}>
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          🤖
        </button>
      )}

      {isOpen && (
        <div style={{
          width: "350px",
          height: "500px",
          backgroundColor: "white",
          borderRadius: "15px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #ddd"
        }}>
          <div style={{ padding: "15px", background: "#007bff", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Assistant Scoolize</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
          </div>

          <div style={{ flex: 1, padding: "15px", overflowY: "auto", background: "#f8f9fa" }}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "10px"
              }}>
                <div style={{
                  maxWidth: "85%",
                  padding: "8px 15px",
                  borderRadius: "15px",
                  fontSize: "0.9rem",
                  backgroundColor: msg.role === "user" ? "#007bff" : "#e9ecef",
                  color: msg.role === "user" ? "white" : "#333",
                  borderBottomRightRadius: msg.role === "user" ? "2px" : "15px",
                  borderBottomLeftRadius: msg.role === "model" ? "2px" : "15px",
                  lineHeight: "1.4"
                }}>
                  {msg.role === "model" ? (
                    <ReactMarkdown 
                        components={{
                            p: ({node, ...props}) => <p style={{margin: '0 0 5px 0'}} {...props} />,
                            ul: ({node, ...props}) => <ul style={{margin: '0 0 5px 0', paddingLeft: '20px'}} {...props} />,
                            li: ({node, ...props}) => <li style={{marginBottom: '2px'}} {...props} />
                        }}
                    >
                        {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && <div style={{ color: "#888", fontSize: "0.8rem", marginLeft: "10px" }}>L'assistant écrit...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ borderTop: "1px solid #ddd", padding: "10px", display: "flex" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ccc", marginRight: "10px", outline: "none" }}
            />
            <button type="submit" disabled={isLoading} style={{ background: "#28a745", color: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer" }}>➤</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;