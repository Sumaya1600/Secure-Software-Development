import { useState } from "react";
import axios from "axios";

export default function CreateCampaign() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [recipients, setRecipients] = useState("");
  const [sendDate, setSendDate] = useState("");

  async function createCampaign() {
    try {
      const res = await axios.post("http://localhost:4000/campaign/create", {
        name,
        subject,
        emailBody,
        recipients: recipients.split(",").map(r => r.trim()),
        sendDate,
      });

      const id = res.data.campaign.id;

      await axios.post(`http://localhost:4000/campaign/send/${id}`);

      alert("Campaign created & emails sent! Check MailHog.");
    } catch (err) {
      console.log(err);
      alert("Error creating campaign");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Campaign</h1>

      <input placeholder="Campaign Name" onChange={e => setName(e.target.value)} /><br /><br />
      <input placeholder="Email Subject" onChange={e => setSubject(e.target.value)} /><br /><br />
      <textarea placeholder="Email Body" onChange={e => setEmailBody(e.target.value)} /><br /><br />
      <textarea placeholder="Recipients (comma separated)" onChange={e => setRecipients(e.target.value)} /><br /><br />
      <input type="datetime-local" onChange={e => setSendDate(e.target.value)} /><br /><br />

      <button onClick={createCampaign}>Create & Send</button>
    </div>
  );
}
