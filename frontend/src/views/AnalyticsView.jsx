import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { fetchAnalyticsDashboard, fetchUserStats } from '../api';
import { format, parseISO } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsView({ currentUser, theme }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState(currentUser?.role === 'admin' ? 'admin' : 'user');

  useEffect(() => {
    loadAnalytics();
  }, [viewMode]);

  async function loadAnalytics() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('jwt_token');

      if (viewMode === 'admin' && currentUser?.role === 'admin') {
        const data = await fetchAnalyticsDashboard(token);
        setAnalyticsData(data);
      }

      if (viewMode === 'user' || currentUser?.role !== 'admin') {
        const userStatsData = await fetchUserStats(token);
        setUserStats(userStatsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatBytes(bytes) {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return bytes + ' B';
  }

  function prepareDailyUploadsChart() {
    if (!analyticsData?.dailyUploads) return null;

    const last30Days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last30Days.push({
        date: format(date, 'yyyy-MM-dd'),
        count: 0
      });
    }

    // Map actual data to the 30-day structure
    analyticsData.dailyUploads.forEach(item => {
      const dateStr = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      const dayIndex = last30Days.findIndex(day => day.date === dateStr);
      if (dayIndex !== -1) {
        last30Days[dayIndex].count = item.count;
      }
    });

    return {
      labels: last30Days.map(day => format(parseISO(day.date), 'MMM dd')),
      datasets: [
        {
          label: 'Documents Uploaded',
          data: last30Days.map(day => day.count),
          borderColor: theme === 'dark' ? '#8b5cf6' : '#6366f1',
          backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          tension: 0.1,
          fill: true,
        },
      ],
    };
  }

  function prepareWeeklyUploadsChart() {
    if (!analyticsData?.weeklyUploads) return null;

    return {
      labels: analyticsData.weeklyUploads.map(item => `Week ${item._id.week}, ${item._id.year}`),
      datasets: [
        {
          label: 'Documents',
          data: analyticsData.weeklyUploads.map(item => item.count),
          backgroundColor: theme === 'dark' ? '#8b5cf6' : '#6366f1',
        },
      ],
    };
  }

  function prepareFileTypeChart() {
    const data = viewMode === 'admin' ? analyticsData?.fileTypeStats : userStats?.fileTypes;
    if (!data) return null;

    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e',
      '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
      '#6b7280', '#f59e0b'
    ];

    return {
      labels: data.map(item => item._id?.toUpperCase() || 'Unknown'),
      datasets: [
        {
          data: data.map(item => item.count),
          backgroundColor: colors.slice(0, data.length),
          borderColor: theme === 'dark' ? '#374151' : '#fff',
          borderWidth: 2,
        },
      ],
    };
  }

  function prepareStorageChart() {
    if (!analyticsData?.storagePerUser) return null;

    return {
      labels: analyticsData.storagePerUser.map(user => user.username),
      datasets: [
        {
          label: 'Storage Used (MB)',
          data: analyticsData.storagePerUser.map(user => (user.totalSize / (1024 * 1024)).toFixed(2)),
          backgroundColor: theme === 'dark' ? '#8b5cf6' : '#6366f1',
        },
      ],
    };
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          padding: 20,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="analytics-view">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#6366f1' }}></i>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-view">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadAnalytics}>
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-view">
      <div className="analytics-header">
        <h2>
          <i className="fas fa-chart-line"></i>
          Analytics Dashboard
        </h2>

        {currentUser?.role === 'admin' && (
          <div className="view-mode-tabs">
            <button
              className={`tab-button ${viewMode === 'admin' ? 'active' : ''}`}
              onClick={() => setViewMode('admin')}
            >
              <i className="fas fa-users-cog"></i>
              Admin View
            </button>
            <button
              className={`tab-button ${viewMode === 'user' ? 'active' : ''}`}
              onClick={() => setViewMode('user')}
            >
              <i className="fas fa-user"></i>
              My Stats
            </button>
          </div>
        )}
      </div>

      {viewMode === 'admin' && analyticsData && (
        <div className="admin-analytics">
          {/* Overview Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="stat-content">
                <h3>{analyticsData.totalStats.documents}</h3>
                <p>Total Documents</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h3>{analyticsData.totalStats.users}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-hdd"></i>
              </div>
              <div className="stat-content">
                <h3>{formatBytes(analyticsData.totalStats.storage)}</h3>
                <p>Storage Used</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-content">
                <h3>{analyticsData.activeUsers.length}</h3>
                <p>Active Users (30d)</p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Daily Uploads Chart */}
            <div className="chart-card">
              <h3>
                <i className="fas fa-calendar-day"></i>
                Documents Uploaded Daily (Last 30 Days)
              </h3>
              {prepareDailyUploadsChart() && (
                <Line data={prepareDailyUploadsChart()} options={chartOptions} />
              )}
            </div>

            {/* Weekly Uploads Chart */}
            <div className="chart-card">
              <h3>
                <i className="fas fa-calendar-week"></i>
                Weekly Upload Trends
              </h3>
              {prepareWeeklyUploadsChart() && (
                <Bar data={prepareWeeklyUploadsChart()} options={chartOptions} />
              )}
            </div>

            {/* File Type Distribution */}
            <div className="chart-card">
              <h3>
                <i className="fas fa-file-code"></i>
                File Type Distribution
              </h3>
              {prepareFileTypeChart() && (
                <Doughnut data={prepareFileTypeChart()} options={doughnutOptions} />
              )}
            </div>

            {/* Storage per User */}
            <div className="chart-card">
              <h3>
                <i className="fas fa-users"></i>
                Storage Usage by User
              </h3>
              {prepareStorageChart() && (
                <Bar data={prepareStorageChart()} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Data Tables */}
          <div className="tables-grid">
            {/* Active Users Table */}
            <div className="table-card">
              <h3>
                <i className="fas fa-user-check"></i>
                Most Active Users
              </h3>
              <div className="table-container">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Actions</th>
                      <th>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.activeUsers.slice(0, 10).map(user => (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.actionCount}</td>
                        <td>{format(parseISO(user.lastActivity), 'MMM dd, HH:mm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Documents Table */}
            <div className="table-card">
              <h3>
                <i className="fas fa-trophy"></i>
                Most Accessed Documents
              </h3>
              <div className="table-container">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Type</th>
                      <th>Uploader</th>
                      <th>Access Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topDocuments.map(doc => (
                      <tr key={doc._id}>
                        <td className="doc-title">{doc.title}</td>
                        <td>
                          <span className="file-type">{doc.fileType?.toUpperCase()}</span>
                        </td>
                        <td>{doc.uploader}</td>
                        <td>
                          <span className="access-count">{doc.accessCount}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'user' && userStats && (
        <div className="user-analytics">
          {/* User Stats Overview */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-file"></i>
              </div>
              <div className="stat-content">
                <h3>{userStats.totalDocuments}</h3>
                <p>My Documents</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-hdd"></i>
              </div>
              <div className="stat-content">
                <h3>{formatBytes(userStats.totalStorage)}</h3>
                <p>Storage Used</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-content">
                <h3>{userStats.recentActivity.length}</h3>
                <p>Recent Actions</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-file-code"></i>
              </div>
              <div className="stat-content">
                <h3>{userStats.fileTypes.length}</h3>
                <p>File Types</p>
              </div>
            </div>
          </div>

          {/* User Charts */}
          <div className="charts-grid">
            <div className="chart-card">
              <h3>
                <i className="fas fa-file-code"></i>
                My File Type Distribution
              </h3>
              {prepareFileTypeChart() && (
                <Doughnut data={prepareFileTypeChart()} options={doughnutOptions} />
              )}
            </div>

            <div className="chart-card">
              <h3>
                <i className="fas fa-history"></i>
                Recent Activity
              </h3>
              <div className="activity-list">
                {userStats.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <i className={`fas fa-${activity.action === 'upload' ? 'upload' :
                          activity.action === 'download' ? 'download' :
                            activity.action === 'view' ? 'eye' : 'file'
                        }`}></i>
                    </div>
                    <div className="activity-content">
                      <p><strong>{activity.action}</strong> - {activity.document?.title}</p>
                      <small>{format(parseISO(activity.timestamp), 'MMM dd, yyyy HH:mm')}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
