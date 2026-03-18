import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, Map, Calendar } from 'lucide-react';

// Simple Home component
function HomePage() {
    return (
        <div className="p-8 text-center">
            <Home className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Petrograd 1917</h1>
            <p className="text-gray-600">February Revolution Interactive Map</p>
        </div>
    );
}

// Simple Map component
function MapPage() {
    return (
        <div className="p-8">
            <Map className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Map</h2>
            <div className="bg-gray-200 h-96 rounded flex items-center justify-center">
                <p className="text-gray-500">Map will be here</p>
            </div>
        </div>
    );
}

// Simple Events component
function EventsPage() {
    return (
        <div className="p-8">
            <Calendar className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Events</h2>
            <div className="space-y-2">
                {['Feb 23', 'Feb 25', 'Feb 27', 'Mar 2'].map(date => (
                    <div key={date} className="p-3 bg-gray-100 rounded">
                        {date}: Demonstrations and strikes
                    </div>
                ))}
            </div>
        </div>
    );
}

// Main App with navigation
function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                {/* Simple navigation */}
                <nav className="bg-white shadow p-4 flex gap-4">
                    <Link to="/" className="flex items-center gap-1 text-blue-600">
                        <Home className="w-4 h-4" /> Home
                    </Link>
                    <Link to="/map" className="flex items-center gap-1 text-blue-600">
                        <Map className="w-4 h-4" /> Map
                    </Link>
                    <Link to="/events" className="flex items-center gap-1 text-blue-600">
                        <Calendar className="w-4 h-4" /> Events
                    </Link>
                </nav>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/events" element={<EventsPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;