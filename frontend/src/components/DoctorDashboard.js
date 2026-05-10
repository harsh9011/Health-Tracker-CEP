import React from 'react';

function DoctorDashboard() {
  return (
    <div>
      <div className="header">
        <h1>Doctor Dashboard</h1>
      </div>
      <div className="container">
        <div className="card">
          <h2>Welcome to Your Doctor Portal</h2>
          <p>Manage your patients and their health records.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h3>Patient List</h3>
            <p>View and manage your patients.</p>
            <button className="btn">View Patients</button>
          </div>
          
          <div className="card">
            <h3>Patient Records</h3>
            <p>Access patient health records.</p>
            <button className="btn">View Records</button>
          </div>
          
          <div className="card">
            <h3>Analytics</h3>
            <p>View health analytics and trends.</p>
            <button className="btn">View Analytics</button>
          </div>
          
          <div className="card">
            <h3>Appointments</h3>
            <p>Manage your schedule and appointments.</p>
            <button className="btn">View Schedule</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
