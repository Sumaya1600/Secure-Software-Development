// frontend/src/components/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaigns, deleteCampaign, launchCampaign } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // RBAC (UI only — backend still enforces for real)
  const role = (user?.role || "").toLowerCase();
  const canCreate = role === "admin" || role === "instructor";
  const canLaunch = role === "admin" || role === "instructor";
  const canDelete = role === "admin";

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCampaigns = async () => {
    setError("");
    try {
      const response = await getCampaigns();
      setCampaigns(response.data?.campaigns || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const normaliseStatus = (s) => String(s || "").trim().toLowerCase();

  const handleLaunch = async (id) => {
    if (!window.confirm("Launch this campaign? Emails will be sent to all recipients.")) return;

    try {
      await launchCampaign(id);
      alert("Campaign launched successfully!");
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to launch campaign";
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign? This cannot be undone.")) return;

    try {
      await deleteCampaign(id);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to delete campaign";
      alert(msg);
    }
  };

  const calculateMetrics = (campaign) => {
    const total = Number(campaign.recipient_count || 0);
    const opens = Number(campaign.opens || 0);
    const clicks = Number(campaign.clicks || 0);
    const reports = Number(campaign.reports || 0);

    const openRate = total > 0 ? (opens / total) * 100 : 0;
    const clickRate = total > 0 ? (clicks / total) * 100 : 0;
    const reportRate = total > 0 ? (reports / total) * 100 : 0;

    return {
      total,
      opens,
      clicks,
      reports,
      openRate: openRate.toFixed(1),
      clickRate: clickRate.toFixed(1),
      reportRate: reportRate.toFixed(1)
    };
  };

  const chartData = useMemo(() => {
    return campaigns.map((c) => {
      const m = calculateMetrics(c);
      return {
        name: String(c.name || "").substring(0, 20),
        "Open Rate": Number(m.openRate),
        "Click Rate": Number(m.clickRate),
        "Report Rate": Number(m.reportRate)
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🎣 Phishing Portal</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email} ({role || "unknown"})
              </span>

              {/* Only Admin/Instructor can create */}
              {canCreate && (
                <button
                  onClick={() => navigate("/create-campaign")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  New Campaign
                </button>
              )}

              <button onClick={logout} className="text-gray-600 hover:text-gray-900">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Campaigns</div>
            <div className="text-3xl font-bold text-gray-900">{campaigns.length}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Recipients</div>
            <div className="text-3xl font-bold text-blue-600">
              {campaigns.reduce((sum, c) => sum + Number(c.recipient_count || 0), 0)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Avg Click Rate</div>
            <div className="text-3xl font-bold text-red-600">
              {campaigns.length > 0
                ? (
                    campaigns.reduce((sum, c) => sum + Number(calculateMetrics(c).clickRate), 0) /
                    campaigns.length
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Avg Report Rate</div>
            <div className="text-3xl font-bold text-green-600">
              {campaigns.length > 0
                ? (
                    campaigns.reduce((sum, c) => sum + Number(calculateMetrics(c).reportRate), 0) /
                    campaigns.length
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>
        </div>

        {/* Chart */}
        {campaigns.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Open Rate" />
                <Bar dataKey="Click Rate" />
                <Bar dataKey="Report Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Campaigns Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
          </div>

          {campaigns.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No campaigns yet. {canCreate ? 'Click "New Campaign" to create one.' : "Ask an Admin/Instructor to create one."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => {
                    const metrics = calculateMetrics(campaign);
                    const status = normaliseStatus(campaign.status);

                    const showLaunch = canLaunch && status === "draft";
                    const showDelete = canDelete;

                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">
                            {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : ""}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              status === "active"
                                ? "bg-green-100 text-green-800"
                                : status === "draft"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {status || "unknown"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-900">{metrics.total}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{metrics.openRate}%</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{metrics.clickRate}%</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{metrics.reportRate}%</td>

                        <td className="px-6 py-4 text-sm space-x-3">
                          {showLaunch && (
                            <button
                              onClick={() => handleLaunch(campaign.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Launch
                            </button>
                          )}

                          {/* NOTE: only keep this if you actually have a /campaign/:id route */}
                          {/* If you don't, remove this button to avoid broken navigation */}
                          <button
                            onClick={() => navigate(`/campaign/${campaign.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>

                          {showDelete && (
                            <button
                              onClick={() => handleDelete(campaign.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick hint if admin still can't see Launch */}
        <div className="text-xs text-gray-400 mt-4">
          If Launch isn’t showing: campaign status must be exactly <b>draft</b>. Check phpMyAdmin → campaigns → status.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
