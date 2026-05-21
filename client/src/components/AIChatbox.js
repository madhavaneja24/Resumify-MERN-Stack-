import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiMessageCircle } from 'react-icons/fi';
import axios from 'axios';
import BASE_URL from '../utils/api';
import toast from 'react-hot-toast';

export default function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI resume assistant. Ask me anything about resume writing, ATS optimization, or career advice!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const { data } = await axios.post(`${BASE_URL}/api/ats/chat`, {
        message: userMessage,
        conversationHistory
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const chatButtonStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    zIndex: 1000
  };

  const chatWindowStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '380px',
    height: '500px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden'
  };

  const chatHeaderStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: '#f8f9fa'
  };

  const messageStyle = (role) => ({
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '12px',
    lineHeight: '1.5',
    fontSize: '14px',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    background: role === 'user' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
    color: role === 'user' ? 'white' : '#333',
    border: role === 'user' ? 'none' : '1px solid #e1e8ed',
    borderBottomRightRadius: role === 'user' ? '4px' : '12px',
    borderBottomLeftRadius: role === 'user' ? '12px' : '4px'
  });

  const inputContainerStyle = {
    padding: '16px',
    background: 'white',
    borderTop: '1px solid #e1e8ed',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end'
  };

  const messageInputStyle = {
    flex: 1,
    border: '1px solid #e1e8ed',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none'
  };

  const sendButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          style={chatButtonStyle}
          onClick={() => setIsOpen(true)}
          title="AI Assistant"
        >
          <FiMessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={chatWindowStyle}>
          {/* Header */}
          <div style={chatHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '16px' }}>
              <FiMessageCircle size={20} />
              <span>AI Resume Assistant</span>
            </div>
            <button
              style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setIsOpen(false)}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={messagesContainerStyle}>
            {messages.map((msg, index) => (
              <div key={index} style={messageStyle(msg.role)}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={messageStyle('assistant')}>
                AI is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={inputContainerStyle}>
            <textarea
              style={messageInputStyle}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about resume tips, ATS optimization, career advice..."
              rows={2}
              disabled={loading}
            />
            <button
              style={sendButtonStyle}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
