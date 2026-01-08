import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function LandingPage() {
  const [params] = useSearchParams();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/campaign/info/${params.get("campaign")}`)
      .then((res) => setCampaign(res.data));
  }, []);

  if (!campaign) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>This was a phishing simulation</h1>

      <p>Here are the suspicious indicators in the email:</p>
      <ul>
        <li>Urgent or threatening language</li>
        <li>Strange sender address</li>
        <li>Unexpected request</li>
        <li>Suspicious link</li>
      </ul>

      <h2>Email Subject</h2>
      <p>{campaign.subject}</p>

      <h2>Email Body</h2>
      <p>{campaign.emailBody}</p>
    </div>
  );
}
