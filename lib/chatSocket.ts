// lib/chatSocket.ts (3001 - Recruiter) - PRODUCTION READY
import { io, Socket } from 'socket.io-client';

let recruiterSocket: Socket | null = null;

const getCookie = (name: string): string | null => {
  // Only run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  
  try {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === name && value) {
        return decodeURIComponent(value);
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading cookie:', error);
    return null;
  }
};

const getSocketUrl = (): string => {
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
};

export const getRecruiterChatSocket = (): Socket | null => {
  // Only run in browser
  if (typeof window === 'undefined') {
    return null;
  }

  if (recruiterSocket?.connected) {
    console.log('✅ Returning existing connected socket');
    return recruiterSocket;
  }
  
  const recruiterToken = getCookie('recruiter_token');
  
  if (!recruiterToken) {
    console.warn('⚠️ No recruiter_token found');
    console.log('🔍 Available cookies:', document.cookie.split('; ').map(c => c.split('=')[0]).join(', '));
    return null;
  }
  
  console.log('✅ Found recruiter_token, length:', recruiterToken.length);
  
  recruiterSocket = io(getSocketUrl(), {
    auth: {
      token: recruiterToken,
      userType: 'recruiter' as const
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
  
  console.log('🔌 Recruiter socket connecting to:', getSocketUrl());
  
  recruiterSocket.on('connect', () => {
    console.log('✅ Recruiter socket connected (ID:', recruiterSocket?.id, ')');
  });
  
  recruiterSocket.on('disconnect', (reason) => {
    console.log('🔌 Recruiter socket disconnected:', reason);
  });
  
  recruiterSocket.on('connect_error', (err) => {
    console.error('❌ Recruiter socket connect_error:', err.message);
  });

  recruiterSocket.on('error', (error) => {
    console.error('❌ Socket error event:', error);
  });

  recruiterSocket.on('joined_conversation', (data) => {
    console.log('✅ Successfully joined conversation:', data.conversationId);
  });
  
  return recruiterSocket;
};

export const initRecruiterChatSocket = (): Socket | null => {
  // Only run in browser
  if (typeof window === 'undefined') {
    return null;
  }

  const s = getRecruiterChatSocket();
  if (!s) console.warn('⚠️ Socket unavailable - check if logged in');
  return s;
};

export const disconnectRecruiterSocket = () => {
  if (recruiterSocket) {
    recruiterSocket.disconnect();
    recruiterSocket = null;
    console.log('🔌 Socket disconnected and cleared');
  }
};
