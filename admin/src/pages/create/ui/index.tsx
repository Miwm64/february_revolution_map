import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Event = {
    title: string;
    description: string;
    time: string;
    coordinates: { x: number; y: number };
    prevEvent: number | null;
    nextEvent: number | null;
};

const CreatePage = () => {
    const navigate = useNavigate();

    const [event, setEvent] = useState<Event>({
        title: "",
        description: "",
        time: new Date().toISOString().slice(0, 16),
        coordinates: { x: 0, y: 0 },
        prevEvent: null,
        nextEvent: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = (): string | null => {
        const match = document.cookie.match(/(^| )token=([^;]+)/);
        return match ? match[2] : null;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === "x" || name === "y") {
            setEvent({
                ...event,
                coordinates: { ...event.coordinates, [name]: Number(value) },
            });
        } else if (name === "prevEvent" || name === "nextEvent") {
            setEvent({ ...event, [name]: value ? Number(value) : null });
        } else {
            setEvent({ ...event, [name]: value });
        }
    };

    const handleCreate = () => {
        const token = getToken();
        if (!token) {
            setError("No token");
            setSuccess("");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        fetch("http://frmap.miwm64.spb.ru/api/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, event }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Create failed");
                return res.json();
            })
            .then((res) => {
                if (res.data === null || res.data === 0) throw new Error("Create failed");
                setLoading(false);
                setSuccess("Created successfully!");
                setError("");
                navigate(`/update/${res.data}`, { replace: true });
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to create event");
                setSuccess("");
                setLoading(false);
            });
    };

    return (
        <div className="p-6 max-w-xl mx-auto space-y-4">
            <div className="space-y-4">
                <div>
                    <label className="block font-medium">Title</label>
                    <input
                        name="title"
                        value={event.title}
                        onChange={handleChange}
                        className="border p-2 w-full"
                    />
                </div>

                <div>
                    <label className="block font-medium">Description</label>
                    <textarea
                        name="description"
                        value={event.description}
                        onChange={handleChange}
                        className="border p-2 w-full"
                    />
                </div>

                <div>
                    <label className="block font-medium">Time</label>
                    <input
                        type="datetime-local"
                        name="time"
                        value={event.time}
                        onChange={handleChange}
                        className="border p-2 w-full"
                    />
                </div>

                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block font-medium">X</label>
                        <input
                            type="number"
                            name="x"
                            value={event.coordinates.x}
                            onChange={handleChange}
                            className="border p-2 w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-medium">Y</label>
                        <input
                            type="number"
                            name="y"
                            value={event.coordinates.y}
                            onChange={handleChange}
                            className="border p-2 w-full"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block font-medium">Prev Event ID</label>
                        <input
                            type="number"
                            name="prevEvent"
                            value={event.prevEvent ?? ""}
                            onChange={handleChange}
                            className="border p-2 w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-medium">Next Event ID</label>
                        <input
                            type="number"
                            name="nextEvent"
                            value={event.nextEvent ?? ""}
                            onChange={handleChange}
                            className="border p-2 w-full"
                        />
                    </div>
                </div>

                {/* Messages */}
                {error && <div className="text-red-600">{error}</div>}
                {success && <div className="text-green-600">{success}</div>}

                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                    Create Event
                </button>
            </div>
        </div>
    );
};

export default CreatePage;