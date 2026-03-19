import './output.css';

function App() {
    return (
        <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center p-6 rounded-lg bg-gray-800 shadow-lg">
                <h1 className="text-3xl font-bold mb-4">Hello, Tailwind!</h1>
                <p className="text-gray-300">This is a simple React + Tailwind app.</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
                    Click Me
                </button>
            </div>
        </div>
    );
}

export default App;