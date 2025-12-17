import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, authAPI } from '../utils/api';
import useSSE from '../utils/useSSE';
import ContactList from '../components/ContactList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import AddContactModal from '../components/AddContactModal';
import '../styles/Chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContacts = async () => {
    try {
      const { data } = await chatAPI.getContacts();
      setContacts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const { data } = await chatAPI.getMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSSEMessage = (data) => {
    if (data.type === 'new_message') {
      const { message } = data;
      
      if (selectedUser && 
          (message.sender._id === selectedUser._id || message.receiver._id === selectedUser._id)) {
        setMessages(prev => [...prev, message]);
      }
      
      loadContacts();
    } else if (data.type === 'contact_added') {
      loadContacts();
    }
  };

  useSSE(handleSSEMessage);

  const handleSendMessage = async (content) => {
    if (!selectedUser || !content.trim()) return;

    try {
      const { data } = await chatAPI.sendMessage({
        receiverId: selectedUser._id,
        content: content.trim()
      });
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleAddContact = async (contact) => {
    setContacts(prev => [contact, ...prev]);
    setShowAddContact(false);
  };

  const handleRemoveContact = async (contactId) => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      try {
        await chatAPI.removeContact(contactId);
        setContacts(prev => prev.filter(c => c._id !== contactId));
        if (selectedUser?._id === contactId) {
          setSelectedUser(null);
          setMessages([]);
        }
      } catch (error) {
        console.error('Error removing contact:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>OurChat</h2>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
        
        <div className="current-user">
          <div className="user-avatar">
            {currentUser?.username?.[0]?.toUpperCase()}
          </div>
          <span>{currentUser?.username}</span>
        </div>

        <div className="add-contact-section">
          <button onClick={() => setShowAddContact(true)} className="btn-add-contact">
            + Add Contact
          </button>
        </div>

        <ContactList
          contacts={contacts}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          onRemoveContact={handleRemoveContact}
        />
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="user-info">
                <div className="user-avatar">
                  {selectedUser.username[0].toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser.username}</h3>
                  <span className={`status ${selectedUser.online ? 'online' : 'offline'}`}>
                    {selectedUser.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            <MessageList
              messages={messages}
              currentUserId={currentUser?.id}
              messagesEndRef={messagesEndRef}
            />

            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="no-chat-selected">
            <h2>Select a contact to start chatting</h2>
            <p>Or add a new contact to begin</p>
          </div>
        )}
      </div>

      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onAddContact={handleAddContact}
        />
      )}
    </div>
  );
};

export default Chat;