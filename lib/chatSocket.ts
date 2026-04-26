import { io, Socket } from 'socket.io-client';

let recruiterSocket: Socket | null = null;
let initPromise: Promise<Socket | null> | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://app.keraeva.com';

export const initRecruiterChatSocket = (): Promise<Socket | null> => {
  if (recruiterSocket?.connected) return Promise.resolve(recruiterSocket);
  if (initPromise) return initPromise;

  initPromise = new Promise<Socket | null>((resolve) => {
    try {
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        auth: { userType: 'recruiter' },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('✅ Recruiter socket connected:', socket.id);
        recruiterSocket = socket;
        initPromise = null;
        resolve(socket);
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Socket error:', err.message);
        initPromise = null;
        recruiterSocket = null;
        resolve(null);
      });

      socket.on('disconnect', () => {
        recruiterSocket = null;
        initPromise = null;
      });

    } catch (error) {
      console.error('Socket init failed:', error);
      initPromise = null;
      recruiterSocket = null;
      resolve(null);
    }
  });

  return initPromise;
};

export const getRecruiterChatSocket = (): Socket | null => recruiterSocket;

export const disconnectRecruiterSocket = (): void => {
  if (recruiterSocket) {
    recruiterSocket.disconnect();
    recruiterSocket = null;
    initPromise = null;
  }
};