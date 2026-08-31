import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";

const LogoutButton = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-linear-to-r from-[#853FF9] to-[#4F2593] px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-linear-to-l hover:from-[#853FF9] hover:to-[#4F2593]"
        >
            <LogOut size={16} />
            Logout
        </button>
    );
};

export default LogoutButton;
