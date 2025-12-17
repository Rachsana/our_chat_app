import React from 'react';

const MessageList = ({ messages, currentUserId, messagesEndRef }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isSentByMe = message.sender._id === currentUserId;
          const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);

          return (
            <React.Fragment key={message._id}>
              {showDateSeparator && (
                <div className="date-separator">
                  <span>{formatDate(message.createdAt)}</span>
                </div>
              )}
              <div className={`message ${isSentByMe ? 'sent' : 'received'}`}>
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;