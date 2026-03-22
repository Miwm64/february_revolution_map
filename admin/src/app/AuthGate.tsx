import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthGateProps {
    children: React.ReactNode;
}

// Helper: get token from cookie
const getToken = (): string | null => {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
};

const AuthGate = ({ children }: AuthGateProps) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();

        // ❌ No token → redirect to login
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        // ✅ Validate token via backend
        const validateToken = async () => {
            try {
                const res = await fetch("http://frmap.miwm64.spb.ru/api/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({"token": token}),
                });
                if (!res.ok) throw new Error("HTTP error");

                const data = await res.json();

                // ✅ Check that backend returned success/data=true
                if (!data || data.data !== true) {
                    throw new Error("Invalid token");
                }

                setLoading(false);
            } catch (err) {
                console.error("Token validation failed", err);

                // ❌ invalid token → clear cookie & redirect to login
                document.cookie = "token=; Max-Age=0; path=/;";
                navigate("/login", { replace: true });
            }
        };

        validateToken();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-lg">
                Checking authentication...
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthGate;