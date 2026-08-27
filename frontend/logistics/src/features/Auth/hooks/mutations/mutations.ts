import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { login, register, logout, openGooglePopup } from '../../api/api';
import { useAuthStore } from '../../store/zustandstore';
import type { LoginInput, RegisterInput } from '../../schemas/schemas';
import { toast } from 'sonner';
import type { User } from '../../types/types';

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: (response) => {
      setAuth(response.usuario, response.accessToken);
      toast.success('Sesión iniciada exitosamente');
      navigate({ to: '/', replace: true });
    },
    onError: (error: Error) => {
      console.error('Error al iniciar sesión:', error);
      toast.error(error.message || 'Error al iniciar sesión');
    },
  });
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: (response) => {
      clearAuth();
      toast.success(response.message || 'Sesión cerrada exitosamente');
      navigate({ to: '/login', replace: true });
    },
    onError: (error: Error) => {
      console.error('Error al cerrar sesión:', error);
      toast.error(error.message || 'Error al cerrar sesión');
    },
  });
};

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: Omit<RegisterInput, 'confirmarPassword'>) => register(data),
    onSuccess: (response) => {
      setAuth(response.usuario, response.accessToken);
      toast.success('Cuenta creada exitosamente');
      navigate({ to: '/', replace: true });
    },
    onError: (error: Error) => {
      console.error('Error al registrar:', error);
      toast.error(error.message || 'Error al crear la cuenta');
    },
  });
};


export const useGoogleLoginMutation = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (authPromise: Promise<{ accessToken: string; usuario: User }>) => authPromise,
    onSuccess: (response) => {
      setAuth(response.usuario, response.accessToken);
      toast.success('Sesión iniciada con Google');
      navigate({ to: '/', replace: true });
    },
    onError: (error: Error) => {
      console.error('Error al iniciar sesión con Google:', error);
      toast.error(error.message || 'Error al iniciar sesión con Google');
    },
  });
};
