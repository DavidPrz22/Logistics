import { FcGoogle } from "react-icons/fc"; 
import {Button} from "@/components/ui/button";
import { useGoogleLoginMutation } from "../hooks/mutations/mutations";
import { openGooglePopup } from "../api/api";
import { toast } from "sonner";

export const GoogleButton = () => {
    const { mutate: handleGoogleAuth } = useGoogleLoginMutation();
    
    const handleClick = () => {
        try {
            const { promise } = openGooglePopup();
            handleGoogleAuth(promise);
        } catch (error) {
            toast.error((error as Error).message || 'Error al abrir la ventana de inicio de sesión de Google.');
        }
    };
    
    return (
        <Button className="w-full mt-2" onClick={handleClick}>
        <FcGoogle size={20} />
            Continuar con Google
        </Button>
    )
}