import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "../../../shared/ui/collapsible";
import { Button } from "../../../shared/ui/button";

type Event = {
    id: number;
    title: string;
    description: string;
    time: string;
    coordinates: { x: number; y: number };
    nextEvent: number | null;
    prevEvent: number | null;
};

// Helper to read token from cookies
const getToken = (): string | null => {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
};

// Helper to logout
const logout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    window.location.href = "/login"; // redirect to login
};

const ListPage = () => {
    const [data, setData] = useState<Event[] | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const token = getToken();
        if (!token) {
            logout();
            return;
        }

        fetch("http://frmap.miwm64.spb.ru/api/events", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(res => res.json())
            .then(res => {
                // ✅ Check for authentication
                if (res.error || !res.data) {
                    logout(); // invalid token → logout
                    return;
                }

                setData(res.data);
            })
            .catch(err => {
                console.error(err);
                logout(); // network or other error → logout
            });
    }, []);

    if (!data) return <div className="p-4">Loading...</div>;

    // Filter events by title
    const filteredData = data.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 flex flex-col gap-4">
            {/* Search input */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border p-2 w-full rounded"
                />
            </div>

            {/* Event list */}
            <div className="flex flex-col gap-6">
                {filteredData.map((event) => (
                    <Collapsible key={event.id}>
                        <div className="flex gap-4 items-center">
                            {/* LEFT: large bubble */}
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                                {event.id}
                            </div>

                            {/* RIGHT: card */}
                            <Card className="flex-1">
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle>{event.title}</CardTitle>

                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            Toggle
                                        </Button>
                                    </CollapsibleTrigger>
                                </CardHeader>

                                <CollapsibleContent>
                                    <CardContent className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            {event.description}
                                        </p>

                                        <div className="text-sm">
                                            <span className="font-medium">Time:</span>{" "}
                                            {new Date(event.time).toLocaleString()}
                                        </div>

                                        <div className="text-sm">
                                            <span className="font-medium">Coordinates:</span>{" "}
                                            ({event.coordinates.x}, {event.coordinates.y})
                                        </div>

                                        <div className="flex gap-2 text-sm">
                                            {event.prevEvent !== null && (
                                                <Badge variant="outline">
                                                    Prev: #{event.prevEvent}
                                                </Badge>
                                            )}

                                            {event.nextEvent !== null && (
                                                <Badge variant="outline">
                                                    Next: #{event.nextEvent}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </div>
                    </Collapsible>
                ))}
            </div>
        </div>
    );
};

export default ListPage;