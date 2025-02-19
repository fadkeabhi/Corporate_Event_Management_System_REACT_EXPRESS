import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { format, isFuture, isPast } from "date-fns";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function EventsDashboard() {
    const navigate = useNavigate();

    const { user, loading } = useAuth();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [filter, setFilter] = useState("attending");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/events");
                setEvents(res.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        if (!loading && !user) {
            navigate("/login");
        } else {
            fetchEvents();
        }

    }, []);

    useEffect(() => {
        const now = new Date();
        if (filter === "attending") {
            setFilteredEvents(events.filter((event) => event.attendees.some((attendee) => attendee?._id === user?._id)));
        } else if (filter === "upcoming") {
            setFilteredEvents(events.filter((event) => isFuture(new Date(event.date))));
        } else if (filter === "past") {
            setFilteredEvents(events.filter((event) => isPast(new Date(event.date))));
        }
    }, [events, filter]);

    return (
        <div className="p-4 space-y-6 h-screen w-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-900">Events Dashboard</h1>

            {/* Filter Buttons */}
            <div className="flex space-x-4">
            <Button variant={filter === "attending" ? "default" : "outline"} className={filter === "attending" ? "" : "text-black"} onClick={() => setFilter("attending")}>
                    Attending
                </Button>
                <Button variant={filter === "upcoming" ? "default" : "outline"} className={filter === "upcoming" ? "" : "text-black"} onClick={() => setFilter("upcoming")}>
                    Upcoming
                </Button>
                <Button variant={filter === "past" ? "default" : "outline"} className={filter === "past" ? "" : "text-black"} onClick={() => setFilter("past")}>
                    Past
                </Button>
            </div>

            {/* Event Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <Card key={event._id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{event.title}</CardTitle>
                                <CardDescription>{event.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                        <span className="text-sm">
                                            {format(new Date(event.date), "PPP")} at {format(new Date(event.date), "p")}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPinIcon className="mr-2 h-4 w-4 opacity-70" />
                                        <span className="text-sm">{event.venue}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <UsersIcon className="mr-2 h-4 w-4 opacity-70" />
                                        <span className="text-sm">Capacity: {event.capacity}</span>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Speakers:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {event.speakers.map((speaker, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>{speaker.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">
                                                    <p className="font-medium">{speaker.name}</p>
                                                    <p className="text-xs text-muted-foreground">{speaker.designation}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Badge variant="outline">{event.agenda}</Badge>
                                <Button size="sm">Register</Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500 w-full">No events found.</p>
                )}
            </div>
        </div>
    );
}
