import React, { useState } from 'react';
import { chatAPI } from '../utils/api';
import '../styles/Modal.css';

const AddContactModal = ({ onClose, onAddContact }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const { data } = await chatAPI.searchUsers(searchQuery);
      setSearchResults(data);
      if (data.length === 0) {
        setError('No users found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAddContact = async (user) => {
    setLoading(true);
    setError('');

    try {
      await chatAPI.addContact(user._id);
      onAddContact(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add contact');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Contact</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button onClick={handleSearch} disabled={searching || loading}>
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map(user => (
                <div key={user._id} className="search-result-item">
                  <div className="result-avatar">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="result-info">
                    <div className="result-name">{user.username}</div>
                    <div className="result-email">{user.email}</div>
                  </div>
                  <button
                    onClick={() => handleAddContact(user)}
                    disabled={loading}
                    className="btn-add"
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">
                {searchQuery ? 'Search for users to add them as contacts' : 'Enter a username or email to search'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;