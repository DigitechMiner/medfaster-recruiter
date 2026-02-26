import { io, Socket } from 'socket.io-client';

let recruiterSocket: Socket | null = null;
let isInitializing = false;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://app.keraeva.com';

export const initRecruiterChatSocket = (): Socket | null => {
  if (recruiterSocket?.connected) {
    console.log('✅ Recruiter socket already connected');
    return recruiterSocket;
  }

  if (isInitializing) {
    console.log('Socket initialization in progress...');
    return null;
  }

  isInitializing = true;

  try {
    console.log('🔌 Initializing recruiter socket with cookie auth...');
    recruiterSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true, // ✅ Sends recruiter_token cookie
      auth: {
        userType: 'recruiter', // ✅ Backend reads cookie directly
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    recruiterSocket.on('connect', () => {
      console.log('✅ Recruiter socket connected:', recruiterSocket?.id);
      isInitializing = false;
    });

    recruiterSocket.on('connect_error', (err) => {
      console.error('❌ Recruiter socket error:', err.message);
      isInitializing = false;
    });

    recruiterSocket.on('disconnect', (reason) => {
      console.log('🔌 Recruiter socket disconnected:', reason);
    });

    return recruiterSocket;
  } catch (error) {
    console.error('Error initializing recruiter socket:', error);
    isInitializing = false;
    recruiterSocket = null;
    return null;
  }
};

export const getRecruiterChatSocket = (): Socket | null => recruiterSocket;

export const disconnectRecruiterSocket = () => {
  if (recruiterSocket) {
    recruiterSocket.disconnect();
    recruiterSocket = null;
  }
};
