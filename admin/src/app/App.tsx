// App.tsx
import '../output.css';
import './App.css';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from "../pages/main/ui";
import { Button } from "../shared/ui/button.tsx";
import ListPage from "../pages/list/ui";
import UpdatePage from "../pages/update/ui";
import CreatePage from "../pages/create/ui";
import { Label } from "../shared/ui/label.tsx";
import CreateAdminPage from "../pages/create_admin/ui";
import LoginPage from '../pages/login/ui/index.tsx';
import AuthGate from "./AuthGate.tsx";
import { useEffect, useState } from 'react';

function App() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    // Helper to read username from cookie
    const getUsername = (): string => {
        const match = document.cookie.match(/(^| )username=([^;]+)/);
        return match ? decodeURIComponent(match[2]) : "";
    };

    // Update username state on mount and whenever login cookie changes
    useEffect(() => {
        // Initial check
        setUsername(getUsername());

        // Poll cookies every 1 second to detect login
        const interval = setInterval(() => {
            const current = getUsername();
            if (current !== username) {
                setUsername(current);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [username]);

    const handleLogout = () => {
        document.cookie = "token=; Max-Age=0; path=/;";
        document.cookie = "username=; Max-Age=0; path=/;";
        setUsername("");
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="relative flex justify-between items-center p-4 text-black">
                {/* Left: user info + logout */}
                <div className="flex gap-4 items-center">
                    {username && (
                        <Button variant="outline" onClick={handleLogout}>
                            {username}<br/>
                            Logout
                        </Button>
                    )}
                    <Button className="text-xl"><Link to="/create-admin">Create admin</Link></Button>
                </div>

                {/* Centered Home button */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <Button className="text-xl"><Link to="/">Home</Link></Button>
                </div>

                {/* Right: navigation buttons */}
                <div className="flex gap-4">
                    <Button className="text-xl"><Link to="/list">List of events</Link></Button>
                    <Button className="text-xl"><Link to="/update">Update event</Link></Button>
                    <Button className="text-xl"><Link to="/create">New event</Link></Button>
                </div>
            </nav>

            <div className="flex-1">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* protected routes */}
                    <Route
                        path="/*"
                        element={
                            <AuthGate>
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/list" element={<ListPage />} />
                                    <Route path="/create" element={<CreatePage />} />
                                    <Route path="/create-admin" element={<CreateAdminPage />} />
                                    <Route path="/update/" element={<UpdatePage />} />
                                    <Route path="/update/:id" element={<UpdatePage />} />
                                </Routes>
                            </AuthGate>
                        }
                    />
                </Routes>
            </div>

            <footer className="p-4 text-center">
                <Label className="justify-center text-xl">
                    Developed by bez.bab:<br/>
                    Miwm64 | kessi.kissa | 69n1Ner_ | i11uha
                </Label>
            </footer>
        </div>
    );
}

export default App;