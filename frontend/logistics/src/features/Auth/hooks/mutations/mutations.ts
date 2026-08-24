import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { login, register } from '../../api/api';
import { useAuthStore } from '../../store/zustandstore';
import type { LoginInput, RegisterInput } from '../../schemas/schemas';
import { toast } from 'sonner';

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: (response) => {
      setAuth(response.usuario, response.accessToken, response.refreshToken);
      toast.success('Sesión iniciada exitosamente');
      navigate({ to: '/', replace: true });
    },
    onError: (error: Error) => {
      console.error('Error al iniciar sesión:', error);
      toast.error(error.message || 'Error al iniciar sesión');
    },
  });
};

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: Omit<RegisterInput, 'confirmarPassword'>) => register(data),
    onSuccess: (response) => {
      setAuth(response.usuario, response.accessToken, response.refreshToken);
      toast.success('Cuenta creada exitosamente');
      navigate({ to: '/', replace: true });
    },
    onError: (error: Error) => {
      console.error('Error al registrar:', error);
      toast.error(error.message || 'Error al crear la cuenta');
    },
  });
};
