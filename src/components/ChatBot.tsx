import React, { useState, KeyboardEvent } from 'react';
import styled from 'styled-components';

interface ChatbotContainerProps {
  $isOpen: boolean;
}

interface MessageProps {
  $isBot: boolean;
}

interface Message {
  text: string;
  isBot: boolean;
}

const ChatbotContainer = styled.div<ChatbotContainerProps>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  flex-direction: column;
  z-index: 1000;
`;

const ChatHeader = styled.div`
  padding: 15px;
  background: #007bff;
  color: white;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f8f9fa;
`;

const ChatInput = styled.div`
  padding: 15px;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 8px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const ChatbotButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;
  &:hover {
    background: #0056b3;
  }
`;

const Message = styled.div<MessageProps>`
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  max-width: 80%;
  ${props => props.$isBot ? `
    background: #e9ecef;
    margin-right: auto;
  ` : `
    background: #007bff;
    color: white;
    margin-left: auto;
  `}
`;

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { text: '¡Hola! Soy el asistente de SPK. ¿En qué puedo ayudarte?', isBot: true }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Agregar mensaje del usuario
    setMessages(prev => [...prev, { text: message, isBot: false }]);
    
    // Simular respuesta del bot (placeholder)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: 'Esta es una respuesta de placeholder. El chatbot aún no está implementado.', 
        isBot: true 
      }]);
    }, 1000);
    
    setMessage('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <ChatbotButton onClick={() => setIsOpen(true)} aria-label="Abrir chat">
          <i className="fas fa-comments"></i>
        </ChatbotButton>
      )}
      
      <ChatbotContainer $isOpen={isOpen}>
        <ChatHeader>
          <span>Asistente SPK</span>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            aria-label="Cerrar chat"
          >
            <i className="fas fa-times"></i>
          </button>
        </ChatHeader>
        
        <ChatMessages>
          {messages.map((msg, index) => (
            <Message key={index} $isBot={msg.isBot}>
              {msg.text}
            </Message>
          ))}
        </ChatMessages>
        
        <ChatInput>
          <Input
            type="text"
            placeholder="Escribe tu mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSend} aria-label="Enviar mensaje">
            <i className="fas fa-paper-plane"></i>
          </Button>
        </ChatInput>
      </ChatbotContainer>
    </>
  );
};

export default ChatBot; 