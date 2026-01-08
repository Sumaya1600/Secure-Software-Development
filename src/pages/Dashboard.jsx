import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/campaign/list")
      .then((res) => setCampaigns(res.data))
      .catch(() => console.log("Error loading campaigns"));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <Link to="/create">Create New Campaign</Link>

      <h2>Campaign History</h2>

      {campaigns.length === 0 && <p>No campaigns yet.</p>}

      {campaigns.map((c) => (
        <div key={c.id} style={{ border: "1px solid black", margin: 10, padding: 10 }}>
          <p><strong>{c.name}</strong></p>
          <p>Sent: {new Date(c.sendDate).toLocaleString()}</p>
          <p>Open rate: {c.openRate}%</p>
          <p>Click rate: {c.clickRate}%</p>
          <p>Report rate: {c.reportRate}%</p>
        </div>
      ))}
    </div>
  );
}
