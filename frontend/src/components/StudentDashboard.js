import React from 'react';

function StudentDashboard() {
  return (
    <div>
      <div className="header">
        <h1>Student Health Dashboard</h1>
      </div>
      <div className="container">
        <div className="card">
          <h2>Welcome to Your Health Tracker</h2>
          <p>Monitor your health metrics and track your progress.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h3>Health Metrics</h3>
            <p>Track your vital signs and health data.</p>
            <button className="btn">View Metrics</button>
          </div>
          
          <div className="card">
            <h3>Health History</h3>
            <p>Review your health records over time.</p>
            <button className="btn">View History</button>
          </div>
          
          <div className="card">
            <h3>AI Health Assistant</h3>
            <p>Chat with our AI health assistant.</p>
            <button className="btn">Start Chat</button>
          </div>
          
          <div className="card">
            <h3>Appointments</h3>
            <p>Manage your doctor appointments.</p>
            <button className="btn">View Appointments</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
