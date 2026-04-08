// src/components/StatsCard.js
// Displays a single statistic on the dashboard

import React from 'react';

const StatsCard = ({ icon, label, value, color }) => {
  return (
    <div className="stats-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stats-icon" style={{ color }}>{icon}</div>
      <div className="stats-info">
        <span className="stats-value">{value}</span>
        <span className="stats-label">{label}</span>
      </div>
    </div>
  );
};

export default StatsCard;
