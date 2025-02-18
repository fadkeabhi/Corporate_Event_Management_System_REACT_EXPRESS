import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { axiosInstanceLoggedIn } from "@/services/api";

export default function EditEventPeoples() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { eventId } = useParams();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        venue: "",
        agenda: "",
        capacity: "",
        speakers: [{ name: "", designation: "" }],
        attendees: [],
        guests: [],
    });

    const [error, setError] = useState("");
    const [eventCreator, setEventCreator] = useState(null);
    const [guestData, setGuestData] = useState({ name: "", email: "" });
    const [attendeeEmail, setAttendeeEmail] = useState("");

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await axiosInstanceLoggedIn.get(
                    `/api/events/${eventId}`
                );

                setFormData(res.data);
                setEventCreator(res.data.createdBy);
            } catch (error) {
                setError("Event not found");
            }
        };

        if (!loading && !user) {
            navigate("/login");
        } else {
            fetchEvent();
        }
    }, [user, loading, navigate, eventId]);

    // Add Attendee
    const addAttendee = async () => {
        try {
            if (!attendeeEmail) return;
            const res = await axiosInstanceLoggedIn.post(
                `/api/events/${eventId}/add-attendee`,
                { email: attendeeEmail }
            );

            setFormData({ ...formData, attendees: [...formData.attendees, res.data.user] });
            setAttendeeEmail("");
        } catch (error) {
            setError("Error adding attendee");
        }
    };

    // Remove Attendee
    const removeAttendee = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5001/api/events/${eventId}/remove-attendee/${userId}`, {
                headers: { Authorization: token },
            });

            setFormData({
                ...formData,
                attendees: formData.attendees.filter((attendee) => attendee._id !== userId),
            });
        } catch (error) {
            setError("Error removing attendee");
        }
    };

    // Add Guest
    const addGuest = async () => {
        try {
            if (!guestData.name || !guestData.email) return;
            const res = await axiosInstanceLoggedIn.post(
                `/api/events/${eventId}/add-guest`,
                guestData
            );

            setFormData({ ...formData, guests: [...formData.guests, res.data.guest] });
            setGuestData({ name: "", email: "" });
        } catch (error) {
            setError("Error adding guest");
        }
    };

    // Remove Guest
    const removeGuest = async (guestId) => {
        try {
            await axiosInstanceLoggedIn.delete(
                `/api/events/${eventId}/remove-guest/${guestId}`
            );

            setFormData({
                ...formData,
                guests: formData.guests.filter((guest) => guest._id !== guestId),
            });
        } catch (error) {
            setError("Error removing guest");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-100 p-4">
            <Card className="w-full max-w-3xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-3xl font-bold">Edit Event</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Attendee Management */}
                    <div className="space-y-4">
                        <p className="text-lg font-semibold">Attendees</p>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Attendee Email"
                                value={attendeeEmail}
                                onChange={(e) => setAttendeeEmail(e.target.value)}
                            />
                            <Button type="button" onClick={addAttendee}>Add</Button>
                        </div>
                        <ul>
                            {formData.attendees.map((attendee) => (
                                <li key={attendee._id} className="flex justify-between items-center bg-gray-200 p-2 rounded-md">
                                    {attendee.email}
                                    <Button type="button" className="bg-red-500" onClick={() => removeAttendee(attendee._id)}>Remove</Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Guest Management */}
                    <div className="space-y-4 mt-4">
                        <p className="text-lg font-semibold">Guests</p>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Guest Name"
                                value={guestData.name}
                                onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                            />
                            <Input
                                placeholder="Guest Email"
                                value={guestData.email}
                                onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                            />
                            <Button type="button" onClick={addGuest}>Add</Button>
                        </div>
                        <ul>
                            {formData.guests.map((guest) => (
                                <li key={guest._id} className="flex justify-between items-center bg-gray-200 p-2 rounded-md">
                                    {guest.name} ({guest.email})
                                    <Button type="button" className="bg-red-500" onClick={() => removeGuest(guest._id)}>Remove</Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <Button type="button" className="mt-2 w-full" onClick={() => navigate(`/event/${eventId}`)}>Back</Button>
                </CardContent>
            </Card>
        </div>
    );
}
