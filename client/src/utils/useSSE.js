import { useEffect, useRef } from 'react';

const useSSE = (onMessage) => {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const url = `${apiUrl}/chat/stream?token=${token}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      
      setTimeout(() => {
        if (localStorage.getItem('token')) {
          window.location.reload();
        }
      }, 5000);
    };

    eventSourceRef.current = eventSource;

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [onMessage]);

  return eventSourceRef;
};

export default useSSE;