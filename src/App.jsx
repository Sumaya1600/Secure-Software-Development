import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateCampaign from "./pages/CreateCampaign.jsx";
import LandingPage from "./pages/LandingPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create" element={<CreateCampaign />} />
      <Route path="/landing" element={<LandingPage />} />
    </Routes>
  );
}
