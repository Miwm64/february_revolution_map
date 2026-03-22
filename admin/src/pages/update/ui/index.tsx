import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./index.css";

type Event = {
    id: number;
    title: string;
    description: string;
    time: string;
    coordinates: { x: number; y: number };
};

const UpdatePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [inputId, setInputId] = useState(id || ""); // input field
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        let isMounted = true;

        setLoading(true);
        setError("");
        setEvent(null);

        fetch(`http://frmap.miwm64.spb.ru/api/event`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: Number(id) }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Event not found");
                return res.json();
            })
            .then((res) => {
                if (!isMounted) return;

                // adjust depending on your backend format
                if (res.data === null) {
                    throw new Error("Failed to load");
                }

                setEvent(res.data);
                setLoading(false);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error(err);
                setEvent(null);
                setError("Failed to load event");
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleSubmitId = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputId) return;
        navigate(`/update/${inputId}`, { replace: true });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (!event) return;
        const { name, value } = e.target;
        if (name === "x" || name === "y") {
            setEvent({
                ...event,
                coordinates: {
                    ...event.coordinates,
                    [name]: Number(value),
                },
            });
        } else {
            setEvent({ ...event, [name]: value });
        }
    };

    const handleUpdate = () => {
        if (!event) return;
        fetch(`http://frmap.miwm64.spb.ru/api/events/${event.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
        })
            .then((res) => res.json())
            .then(() => alert("Updated successfully!"))
            .catch((err) => console.error(err));
    };

    return (
        <div className="p-6 max-w-xl mx-auto space-y-4">
            {/* Always show ID input */}
            <form onSubmit={handleSubmitId} className="mb-4">
                <label className="block mb-2 font-medium">Enter Event ID:</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={inputId}
                        onChange={(e) => setInputId(e.target.value)}
                        className="border p-2 flex-1"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 rounded"
                    >
                        Load
                    </button>
                </div>
            </form>

            {loading && <div>Loading event...</div>}
            {error && <div className="text-red-600">{error}</div>}

            {event && (
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
                            value={new Date(event.time).toISOString().slice(0, 16)}
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

                    <button
                        onClick={handleUpdate}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default UpdatePage;