import React, { useEffect, useState } from 'react';
import { fetchAllDocuments, fetchUserStats } from '../api';

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

const TOTAL_QUOTA = 1024 * 1024 * 1024; // 1GB quota for example

export default function DataUsageView({ currentUser }) {
  const [used, setUsed] = useState(0);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUsage() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('dms_token') || localStorage.getItem('jwt_token');

        // Load user's personal stats
        const stats = await fetchUserStats(token);
        console.log('User stats response:', stats);
        setUserStats(stats);
        setUsed(stats.totalStorage);

      } catch (e) {
        setError('Failed to load data usage');
        console.error('Data usage error:', e);
      }
      setLoading(false);
    }
    loadUsage();
  }, []);

  const percentUsed = (used / TOTAL_QUOTA) * 100;

  return (
    <div className="data-usage-attractive-card">
      <h2>Data Usage</h2>
      {loading ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading usage data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      ) : (
        <>
          <div className="usage-stats-grid">
            <div className="usage-stat">
              <div className="stat-icon">
                <i className="fas fa-file"></i>
              </div>
              <div className="stat-info">
                <h3>{userStats?.totalDocuments || 0}</h3>
                <p>Total Documents</p>
              </div>
            </div>

            <div className="usage-stat">
              <div className="stat-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <div className="stat-info">
                <h3>{percentUsed.toFixed(1)}%</h3>
                <p>Quota Used</p>
              </div>
            </div>

            <div className="usage-stat">
              <div className="stat-icon">
                <i className="fas fa-hdd"></i>
              </div>
              <div className="stat-info">
                <h3>{formatBytes(used)}</h3>
                <p>Storage Used</p>
              </div>
            </div>
          </div>

          <div
            className="data-usage-progress-section"
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <h3 style={{
              textAlign: 'center',
              marginBottom: '20px',
              width: '100%'
            }}>
              Storage Quota
            </h3>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '15px',
              width: '100%'
            }}>
              <div
                className="data-usage-progress-bar"
                style={{
                  maxWidth: '350px',
                  width: '100%',
                  margin: '0 auto'
                }}
              >
                <div className="bar" style={{
                  width: Math.min(percentUsed, 100) + '%',
                  background: percentUsed > 80 ? '#ef4444' : percentUsed > 60 ? '#f59e0b' : '#10b981'
                }}></div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%',
              flexWrap: 'wrap'
            }}>
              <span style={{ textAlign: 'center' }}>{formatBytes(used)} used</span>
            </div>
          </div>

          <div className="usage-actions">
            <p className="usage-tip">
              <i className="fas fa-lightbulb"></i>
              Tip: Consider removing old or unnecessary files to free up space.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
