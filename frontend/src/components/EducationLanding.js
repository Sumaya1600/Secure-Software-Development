// frontend/src/components/EducationLanding.js
import React from 'react';
import { useParams } from 'react-router-dom';

const EducationLanding = () => {
  const { token } = useParams();

  const indicators = [
    { icon: "📧", title: "Suspicious Sender", desc: "Email from unknown or misspelled domain" },
    { icon: "⚠️", title: "Urgent Language", desc: "Creates false sense of urgency or threat" },
    { icon: "🔗", title: "Suspicious Links", desc: "Hover to reveal actual destination URL" },
    { icon: "🔐", title: "Requests Info", desc: "Asks for passwords or sensitive data" },
    { icon: "✍️", title: "Poor Grammar", desc: "Spelling errors and awkward phrasing" },
    { icon: "👤", title: "Generic Greeting", desc: "'Dear Customer' instead of your name" },
    { icon: "📎", title: "Unexpected Attachments", desc: "Suspicious files or executables" },
    { icon: "🎁", title: "Too Good to True", desc: "Unrealistic prizes or offers" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-red-600 text-white rounded-lg shadow-lg p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🎣</div>
          <h1 className="text-4xl font-bold mb-4">You've Been Phished!</h1>
          <p className="text-xl mb-2">Don't worry - this was a training exercise.</p>
          <p className="text-lg opacity-90">
            You clicked on a simulated phishing link. In a real attack, your information could have been compromised.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">What is Phishing?</h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Phishing is a cyber attack where criminals use fraudulent emails to trick you into 
            revealing sensitive information like passwords or credit card numbers. These attacks 
            often appear to come from trusted sources.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
            <h3 className="font-bold text-lg text-blue-900 mb-2">Why This Training Matters</h3>
            <p className="text-blue-800">
              Over 90% of successful cyber attacks start with phishing. By recognizing these attacks, 
              you become your organization's first line of defense.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">🚩 Red Flags to Watch For</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {indicators.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">✅ What Should You Do?</h2>
          
          <div className="space-y-4">
            {[
              { n: 1, title: "Think Before You Click", desc: "Always verify sender and hover over links" },
              { n: 2, title: "Report Suspicious Emails", desc: "Forward to IT security team immediately" },
              { n: 3, title: "Verify Through Other Channels", desc: "Call sender using known phone number" },
              { n: 4, title: "Keep Software Updated", desc: "Update OS, browser, and antivirus regularly" }
            ].map(item => (
              <div key={item.n} className="flex items-start">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 mr-4">
                  {item.n}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 text-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Remember</h3>
          <p className="text-lg mb-4">
            This was a training exercise. No real harm was done, and no data was collected.
          </p>
          <div className="mt-6">
            <a 
              href="/"
              className="inline-block bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationLanding;