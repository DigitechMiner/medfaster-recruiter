import { io, Socket } from 'socket.io-client';

let recruiterSocket: Socket | null = null;
let isInitializing = false;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const initRecruiterChatSocket = async (): Promise<Socket | null> => {
  if (recruiterSocket?.connected) {
    console.log('Recruiter socket already connected');
    return recruiterSocket;
  }

  if (isInitializing) {
    console.log('Socket initialization in progress...');
    return null;
  }

  isInitializing = true;

  try {
    console.log('Fetching socket token...');
    const res = await fetch('http://localhost:4000/api/v1/common/socket-token', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      console.warn('Failed to get socket token:', res.status);
      isInitializing = false;
      return null;
    }

    const data = await res.json();
    const token = data.token;

    if (!token) {
      console.warn('No token in response');
      isInitializing = false;
      return null;
    }

    console.log('Initializing recruiter socket...');
    recruiterSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        token,
        userType: 'recruiter',
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    recruiterSocket.on('connect', () => {
      console.log('✅ Recruiter socket connected:', recruiterSocket?.id);
    });

    recruiterSocket.on('connect_error', (err) => {
      console.error('❌ Recruiter socket error:', err.message);
    });

    recruiterSocket.on('disconnect', (reason) => {
      console.log('🔌 Recruiter socket disconnected:', reason);
    });

    // Wait for connection
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, 5000);

      recruiterSocket?.once('connect', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      recruiterSocket?.once('connect_error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    isInitializing = false;
    return recruiterSocket;
  } catch (error) {
    console.error('Error initializing recruiter socket:', error);
    isInitializing = false;
    recruiterSocket = null;
    return null;
  }
};

export const getRecruiterChatSocket = (): Socket | null => {
  return recruiterSocket;
};

export const disconnectRecruiterSocket = () => {
  if (recruiterSocket) {
    recruiterSocket.disconnect();
    recruiterSocket = null;
  }
};
