import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import './App.css';
import axios from 'axios'; // using axios for cleaner requests

const App = () => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [role, setRole] = useState('User');
  const [chatVisible, setChatVisible] = useState(false);
  const [fileContent, setFileContent] = useState('');

  const askQuestion = async (question) => {
    const userMessage = { sender: 'User', text: question };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `${question}\n\nContext:\n${fileContent}` },
        ],
        model: 'openchat/openchat-7b:free',
      });

      const botReply = response.data.choices?.[0]?.message?.content || "Sorry, I couldn't respond.";
      const botMessage = { sender: 'Bot', text: botReply };
      setMessages((prev) => [...prev, botMessage]);
      setQuestion('');
    } catch (error) {
      console.error(error);
      const botMessage = { sender: 'Bot', text: "Sorry, something went wrong." };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <>
      <button className="chat-toggle" onClick={() => setChatVisible(!chatVisible)}>
        💬
      </button>

      {chatVisible && (
        <div className="chat-box">
          <div className="chat-header">
            Chatbot
            <button onClick={() => setChatVisible(false)}>✖</button>
          </div>

          <div className="chat-body">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>

            {role === 'Admin' && <FileUpload onFileContentExtracted={setFileContent} />}

            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.sender.toLowerCase()}`}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>

          {role === 'User' && (
            <div className="chat-input">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion(question)}
                placeholder="Ask a question..."
              />
              <button onClick={() => askQuestion(question)}>Send</button>
            </div>
          )}

          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat}>Clear Chat</button>
          )}
        </div>
      )}
    </>
  );
};

export default App;
