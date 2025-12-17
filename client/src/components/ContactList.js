import React, { useState } from 'react';

const ContactList = ({ contacts, selectedUser, onSelectUser, onRemoveContact }) => {
  const [hoveredContact, setHoveredContact] = useState(null);

  const formatLastSeen = (date) => {
    const lastSeen = new Date(date);
    const now = new Date();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="contact-list">
      <h3>Contacts ({contacts.length})</h3>
      <div className="contacts">
        {contacts.length === 0 ? (
          <p className="no-contacts">No contacts yet. Click "Add Contact" to get started!</p>
        ) : (
          contacts.map(user => (
            <div
              key={user._id}
              className={`contact-item ${selectedUser?._id === user._id ? 'active' : ''}`}
              onClick={() => onSelectUser(user)}
              onMouseEnter={() => setHoveredContact(user._id)}
              onMouseLeave={() => setHoveredContact(null)}
            >
              <div className="contact-avatar">
                {user.username[0].toUpperCase()}
                {user.online && <span className="online-indicator"></span>}
              </div>
              <div className="contact-info">
                <div className="contact-name">{user.username}</div>
                <div className="contact-status">
                  {user.online ? 'Online' : formatLastSeen(user.lastSeen)}
                </div>
              </div>
              {hoveredContact === user._id && (
                <button
                  className="btn-remove-contact"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveContact(user._id);
                  }}
                  title="Remove contact"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactList;