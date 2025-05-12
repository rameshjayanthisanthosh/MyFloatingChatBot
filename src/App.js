import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [chatVisible, setChatVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-scroll
  useEffect(() => {
    const chatBody = document.querySelector('.chat-messages');
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }, [messages]);

  // Load chat from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save chat to localStorage
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const askQuestion = async (question) => {
    if (!question.trim()) return;

    const userMessage = {
      sender: 'User',
      text: question,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: question },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process your request.";

      const botMessage = {
        sender: 'Bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, botMessage]);
      setQuestion('');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setMessages((prev) => [...prev, {
        sender: 'Bot',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  return (
    <div className="app-container">
      <button 
        className="chat-toggle"
        onClick={() => setChatVisible(!chatVisible)}
        aria-label={chatVisible ? "Close chat" : "Open chat"}
      >
        {chatVisible ? '✖' : '💬'}
      </button>

      {chatVisible && (
        <div className="chat-box">
          <div className="chat-header">
            <h2>AI Assistant</h2>
            <button 
              onClick={() => setChatVisible(false)}
              className="close-btn"
              aria-label="Close chat"
            >
              ✖
            </button>
          </div>

          <div className="chat-body">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <p>Welcome! Ask me anything.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.sender.toLowerCase()}-msg`}>
                    <div className="msg-header">
                      <strong>{msg.sender}:</strong>
                      <span className="msg-time">{msg.timestamp}</span>
                    </div>
                    <div className="msg-text">{msg.text}</div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="chat-msg bot-msg">
                  <div className="msg-header">
                    <strong>Bot:</strong>
                  </div>
                  <div className="msg-text typing-indicator">
                    <span>•</span><span>•</span><span>•</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="error-message">
                  Error: {error}
                </div>
              )}
            </div>
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && askQuestion(question)}
              disabled={isLoading}
            />
            <button 
              onClick={() => !isLoading && askQuestion(question)}
              disabled={isLoading || !question.trim()}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>

          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat}>
              Clear Chat History
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
