import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import CreateEvent from "@/pages/CreateEvent";
import Register from "@/pages/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/event" element={<CreateEvent />} />
      </Routes>
    </Router>
  );
}

export default App;
