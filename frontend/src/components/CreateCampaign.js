// frontend/src/components/CreateCampaign.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../services/api';

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    name: '',
    templateSubject: '',
    templateBody: '',
    recipients: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const recipientEmails = formData.recipients
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (recipientEmails.length === 0) {
      setError('Please add at least one recipient');
      setLoading(false);
      return;
    }

    if (recipientEmails.length > 1000) {
      setError('Maximum 1000 recipients allowed');
      setLoading(false);
      return;
    }

    try {
      await createCampaign({
        name: formData.name,
        templateSubject: formData.templateSubject,
        templateBody: formData.templateBody,
        recipients: recipientEmails
      });
      
      alert('Campaign created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Back to Dashboard
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Phishing Campaign</h1>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Q1 Security Training"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                name="templateSubject"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Urgent: Verify Your Account"
                value={formData.templateSubject}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                Use variables: {"{{recipient_email}}"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body (HTML) *
              </label>
              <textarea
                name="templateBody"
                required
                rows="12"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                placeholder="<p>Dear user,</p><p>Please click <a href='{{link}}'>here</a> to verify your account.</p>"
                value={formData.templateBody}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                Available variables: {"{{link}}"}, {"{{recipient_email}}"}, {"{{report_link}}"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients (one email per line) *
              </label>
              <textarea
                name="recipients"
                required
                rows="8"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                value={formData.recipients}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum 1000 recipients. Line count: {formData.recipients.split('\n').filter(l => l.trim()).length}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Ethical Use Warning</h3>
              <p className="text-sm text-yellow-800">
                This tool is for educational purposes only. All recipients should be informed 
                this is a training exercise. Never use this to harm, deceive, or collect 
                real sensitive information.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;