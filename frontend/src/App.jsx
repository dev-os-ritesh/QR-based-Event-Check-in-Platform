import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import Scanner from "./pages/Scanner";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import Layout from "./components/Layout";

export default function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-zinc-500 font-medium animate-pulse">Loading session...</div>;
  }

  // Guard: Restricts nested organizer sub-pages to organizer roles only
  const OrgRoute = ({ children }) => (user?.role === "organizer" ? children : <Navigate to="/" />);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === "organizer" ? "/organizer" : "/"} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* ── Public Route View (accessible without authentication) ── */}
        <Route element={<Layout />}>
          <Route path="/" element={<Events />} />
        </Route>

        {/* ── Private Routes (redirects unauthenticated users to /login) ── */}
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/organizer" element={<OrgRoute><OrganizerDashboard /></OrgRoute>} />
          <Route path="/create-event" element={<OrgRoute><CreateEvent /></OrgRoute>} />
          <Route path="/scanner" element={<OrgRoute><Scanner /></OrgRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}
