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
import { useNavigate } from "react-router-dom";

type Event = {
    id: number;
    title: string;
    description: string;
    time: string;
    coordinates: { x: number; y: number };
    nextEvent: number | null;
    prevEvent: number | null;
};

const getToken = (): string | null => {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
};

const logout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    window.location.href = "/admin/login";
};

const ListPage = () => {
    const [data, setData] = useState<Event[] | null>(null);
    const [sortType, setSortType] = useState<"id" | "time">("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            logout();
            return;
        }

        fetch("http://frmap.miwm64.spb.ru/api/events", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then(res => res.json())
            .then(res => {
                if (res.error || !res.data) {
                    logout();
                    return;
                }
                setData(res.data);
            })
            .catch(err => {
                console.error(err);
                logout();
            });
    }, []);

    if (!data) return <div className="p-4">Loading...</div>;

    const sortedData = [...data].sort((a, b) => {
        let valA: number | string = sortType === "id" ? a.id : a.time;
        let valB: number | string = sortType === "id" ? b.id : b.time;

        if (sortType === "time") {
            valA = new Date(a.time).getTime();
            valB = new Date(b.time).getTime();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    return (
        <div className="p-6 flex flex-col gap-4">
            {/* Sorting controls */}
            <div className="flex gap-2 mb-4 items-center">
                {/* Sort Type */}
                <span className="font-medium">Sort by:</span>
                <Button
                    variant={sortType === "id" ? "default" : "outline"}
                    onClick={() => setSortType("id")}
                    className={sortType === "id" ? "bg-blue-500 text-white" : ""}
                >
                    ID {sortType === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>
                <Button
                    variant={sortType === "time" ? "default" : "outline"}
                    onClick={() => setSortType("time")}
                    className={sortType === "time" ? "bg-blue-500 text-white" : ""}
                >
                    Time {sortType === "time" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>

                {/* Toggle order separately */}
                <Button
                    variant="outline"
                    onClick={() => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))}
                    className="ml-4"
                >
                    Order: {sortOrder.toUpperCase()} {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
            </div>

            <div className="flex flex-col gap-6">
                {sortedData.map((event) => (
                    <Collapsible key={event.id}>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                                {event.id}
                            </div>

                            <Card className="flex-1">
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle>{event.title}</CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/update/${event.id}`)}
                                        >
                                            Edit
                                        </Button>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                Toggle
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                </CardHeader>

                                <CollapsibleContent>
                                    <CardContent className="space-y-2">
                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                        <div className="text-sm">
                                            <span className="font-medium">Time:</span>{" "}
                                            {new Date(event.time).toLocaleString()}
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">Coordinates:</span>{" "}
                                            ({event.coordinates.x}, {event.coordinates.y})
                                        </div>
                                        <div className="flex gap-2 text-sm">
                                            {event.prevEvent !== null && <Badge variant="outline">Prev: #{event.prevEvent}</Badge>}
                                            {event.nextEvent !== null && <Badge variant="outline">Next: #{event.nextEvent}</Badge>}
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