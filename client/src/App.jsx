import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import CreateEvent from "@/pages/CreateEvent";
import Register from "@/pages/Register";
import EditEvent from "./pages/EditEvent";
import EditEventPeoples from "./pages/EditEventGuestsAttendies";
import EventsDashboard from "./pages/EventsDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<EventsDashboard />} />
        <Route path="/event" element={<CreateEvent />} />
        <Route path="/event/:eventId" element={<EditEvent />} />
        <Route path="/event-peoples/:eventId" element={<EditEventPeoples />} />

      </Routes>
    </Router>
  );
}

export default App;
