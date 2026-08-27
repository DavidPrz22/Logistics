import apiClient from '@/api/client';
import type { LoginInput, RegisterInput, AuthResponse } from '../schemas/schemas';
import type { User } from '../types/types';

export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<{message: string}> => {
  const response = await apiClient.post<{message: string}>('/auth/logout');
  return response.data;
};

export const register = async (data: Omit<RegisterInput, 'confirmarPassword'>): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const refreshAccessToken = async (): Promise<{ user: User; accessToken: string }> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh-token');
  return {
    user: response.data.usuario,
    accessToken: response.data.accessToken,
  };
};

export const openGooglePopup = (): {
  popup: Window;
  promise: Promise<{ accessToken: string; usuario: User }>;
} => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/';
  const authUrl = baseURL + 'auth/google/login';

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl,
    'Google Login',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,scrollbars=1,status=1,resizable=1,location=0`,
  );

  if (!popup || popup.closed) {
    throw new Error('El bloqueador de ventanas emergentes impidió abrir la ventana de inicio de sesión de Google.');
  }

  popup.focus();

  const promise = new Promise<{ accessToken: string; usuario: User }>((resolve, reject) => {
    const messageListener = (event: MessageEvent) => {
      console.log('=== MENSAJE RECIBIDO ===');
      console.log('event.origin:', event.origin);
      console.log('event.data:', event.data);
      
      const backendOrigin = new URL(baseURL).origin;
      console.log('backendOrigin esperado:', backendOrigin);
      
      if (event.origin !== backendOrigin) {
        console.log('❌ Origen no coincide, ignorando');
        return;
      }

      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('✅ Autenticación exitosa recibida');
        window.removeEventListener('message', messageListener);
        clearTimeout(timeout);
        resolve(event.data.payload);
      } else {
        console.log('⚠️ Tipo de mensaje desconocido:', event.data?.type);
      }
    };

    window.addEventListener('message', messageListener);
    console.log('✅ Listener de mensajes registrado en window');
    console.log('🔍 Esperando mensajes de:', new URL(baseURL).origin);

    const timeout = setTimeout(() => {
      console.log('❌ Timeout alcanzado (5 minutos)');
      window.removeEventListener('message', messageListener);
      reject(new Error('El tiempo de espera para el inicio de sesión con Google ha expirado.'));
    }, 5 * 60 * 1000);
  });

  return { popup, promise };
};
