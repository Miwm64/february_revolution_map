import '../output.css';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from "../pages/main/ui";
import {Button} from "../shared/ui/button.tsx";
import ListPage from "../pages/list/ui";
import UpdatePage from "../pages/update/ui";
import CreatePage from "../pages/create/ui";
import {Label} from "../shared/ui/label.tsx";
import CreateAdminPage from "../pages/create_admin/ui";


function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <nav className="relative flex justify-between p-4 text-black">
                {/* Left buttons */}
                <div className="flex gap-4">
                    <Button className="text-xl"><Link to="/create-admin">Create admin</Link></Button>
                </div>

                {/* Centered Home button */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <Button className="text-xl"><Link to="/">Home</Link></Button>
                </div>

                {/* Right buttons */}
                <div className="flex gap-4">
                    <Button className="text-xl"><Link to="/list">List of events</Link></Button>
                    <Button className="text-xl"><Link to="/update">Update event</Link></Button>
                    <Button className="text-xl"><Link to="/create">New event</Link></Button>
                </div>
            </nav>

            <div className="flex-1">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/list" element={<ListPage />} />
                    <Route path="/create" element={<CreatePage />} />
                    <Route path="/create-admin" element={<CreateAdminPage />} />
                    <Route path="/update/" element={<UpdatePage />} />
                    <Route path="/update/:id" element={<UpdatePage />} />
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