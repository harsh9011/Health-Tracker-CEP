import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHealthData, setStudentHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'detail'

  // Chart refs
  const bmiChartRef = useRef(null);
  const weightChartRef = useRef(null);
  const waterChartRef = useRef(null);
  const caloriesChartRef = useRef(null);
  const [bmiChartInstance, setBmiChartInstance] = useState(null);
  const [weightChartInstance, setWeightChartInstance] = useState(null);
  const [waterChartInstance, setWaterChartInstance] = useState(null);
  const [caloriesChartInstance, setCaloriesChartInstance] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchAllStudents(token);
    } else {
      setError('No authentication data found');
      setLoading(false);
    }
  }, []);

  const fetchAllStudents = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Filter only students
      const studentsOnly = response.data.users.filter(u => u.role === 'student');
      setStudents(studentsOnly || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch students');
      setLoading(false);
    }
  };

  const fetchStudentHealthData = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/healthData/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStudentHealthData(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch student health data');
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchStudentHealthData(student.id);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setStudentHealthData([]);
    setView('list');
  };

  const filteredStudents = students.filter(student =>
    (student.fullname || student.fullName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (studentHealthData.length > 0) {
      renderCharts();
    }
  }, [studentHealthData]);

  const renderCharts = () => {
    const sortedData = [...studentHealthData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedData.map(data => new Date(data.date).toLocaleDateString());
    const bmiValues = sortedData.map(data => parseFloat(data.bmi) || 0);
    const weightValues = sortedData.map(data => parseFloat(data.weight) || 0);
    const waterValues = sortedData.map(data => parseFloat(data.waterIntake) || 0);
    const caloriesValues = sortedData.map(data => parseFloat(data.caloriesIntake) || 0);

    // Destroy existing charts
    if (bmiChartInstance) {
      bmiChartInstance.destroy();
      setBmiChartInstance(null);
    }
    if (weightChartInstance) {
      weightChartInstance.destroy();
      setWeightChartInstance(null);
    }
    if (waterChartInstance) {
      waterChartInstance.destroy();
      setWaterChartInstance(null);
    }
    if (caloriesChartInstance) {
      caloriesChartInstance.destroy();
      setCaloriesChartInstance(null);
    }

    // BMI Chart
    const bmiCtx = bmiChartRef.current?.getContext('2d');
    if (bmiCtx) {
      const chart = new ChartJS(bmiCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'BMI',
            data: bmiValues,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: false }
          }
        }
      });
      setBmiChartInstance(chart);
    }

    // Weight Chart
    const weightCtx = weightChartRef.current?.getContext('2d');
    if (weightCtx) {
      const chart = new ChartJS(weightCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Weight (kg)',
            data: weightValues,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: false }
          }
        }
      });
      setWeightChartInstance(chart);
    }

    // Water Intake Chart
    const waterCtx = waterChartRef.current?.getContext('2d');
    if (waterCtx) {
      const chart = new ChartJS(waterCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Water Intake (L)',
            data: waterValues,
            borderColor: '#17a2b8',
            backgroundColor: 'rgba(23, 162, 184, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
      setWaterChartInstance(chart);
    }

    // Calories Chart
    const caloriesCtx = caloriesChartRef.current?.getContext('2d');
    if (caloriesCtx) {
      const chart = new ChartJS(caloriesCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Calories Intake',
            data: caloriesValues,
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
      setCaloriesChartInstance(chart);
    }
  };

  if (loading) {
    return <div className="container"><h2>Loading...</h2></div>;
  }

  if (error) {
    return <div className="container"><h2>Error: {error}</h2></div>;
  }

  return (
    <div className="container">
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
          Doctor Dashboard
        </h2>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Student Health Records & Analytics
        </p>
      </div>

      {view === 'list' ? (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '25px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
              Students List ({filteredStudents.length})
            </h3>
            
            {filteredStudents.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {filteredStudents.map((student) => (
                  <div 
                    key={student.id || student.email}
                    onClick={() => handleStudentSelect(student)}
                    style={{
                      padding: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  >
                    <div>
                      <h4 style={{ color: '#2c3e50', marginBottom: '5px' }}>
                        {student.fullname || student.fullName || 'Unknown Name'}
                      </h4>
                      <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                        {student.email || 'No email'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                        Age: {student.age || 'N/A'}
                      </p>
                      <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                        Gender: {student.gender || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666' 
              }}>
                <p>No students found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={handleBackToList}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '20px'
            }}
          >
            ← Back to Students List
          </button>

          {selectedStudent && (
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '25px', 
              borderRadius: '10px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '30px' 
            }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                Student Profile
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px' 
              }}>
                <div>
                  <strong>Name:</strong> {selectedStudent.fullname || selectedStudent.fullName || 'Unknown'}
                </div>
                <div>
                  <strong>Email:</strong> {selectedStudent.email || 'N/A'}
                </div>
                <div>
                  <strong>Age:</strong> {selectedStudent.age || 'N/A'}
                </div>
                <div>
                  <strong>Gender:</strong> {selectedStudent.gender || 'N/A'}
                </div>
              </div>
            </div>
          )}

          {studentHealthData.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
                📈 Health Analytics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                }}>
                  <h4 style={{ color: '#2c3e50', marginBottom: '15px', textAlign: 'center' }}>
                    BMI Progress
                  </h4>
                  <div style={{ height: '250px' }}>
                    <canvas ref={bmiChartRef}></canvas>
                  </div>
                </div>

                <div style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                }}>
                  <h4 style={{ color: '#2c3e50', marginBottom: '15px', textAlign: 'center' }}>
                    Weight Progress
                  </h4>
                  <div style={{ height: '250px' }}>
                    <canvas ref={weightChartRef}></canvas>
                  </div>
                </div>

                <div style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                }}>
                  <h4 style={{ color: '#2c3e50', marginBottom: '15px', textAlign: 'center' }}>
                    Water Intake Progress
                  </h4>
                  <div style={{ height: '250px' }}>
                    <canvas ref={waterChartRef}></canvas>
                  </div>
                </div>

                <div style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                }}>
                  <h4 style={{ color: '#2c3e50', marginBottom: '15px', textAlign: 'center' }}>
                    Calories Intake Progress
                  </h4>
                  <div style={{ height: '250px' }}>
                    <canvas ref={caloriesChartRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
              📋 Health Records History
            </h3>
            {studentHealthData.length > 0 ? (
              studentHealthData.map((data, index) => (
                <div key={index} style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px', 
                  margin: '10px 0', 
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                    <div>
                      <strong>📅 Date:</strong> {new Date(data.date).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>⚖️ Weight:</strong> {data.weight} kg
                    </div>
                    <div>
                      <strong>📏 Height:</strong> {data.height} cm
                    </div>
                    <div>
                      <strong>💧 Water:</strong> {data.waterIntake} L
                    </div>
                    <div>
                      <strong>🔥 Calories:</strong> {data.caloriesIntake}
                    </div>
                    <div>
                      <strong>📊 BMI:</strong> {data.bmi ? parseFloat(data.bmi).toFixed(2) : 'N/A'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <h4>No health records found for this student</h4>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
