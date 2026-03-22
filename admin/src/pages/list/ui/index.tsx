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

const ListPage = () => {
    const [data, setData] = useState<Event[] | null>(null);

    useEffect(() => {
        fetch('http://frmap.miwm64.spb.ru/api/events')
            .then(res => res.json())
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!data) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-6 flex flex-col gap-6">
            {data.map((event) => (
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
    );
};

export default ListPage;