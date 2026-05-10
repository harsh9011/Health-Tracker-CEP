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

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    waterIntake: '',
    caloriesIntake: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
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
      fetchHealthData(token);
    } else {
      setError('No authentication data found');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (healthData.length > 0) {
      renderCharts();
    }
  }, [healthData]);

  const fetchHealthData = async (token) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/healthData/student/${JSON.parse(localStorage.getItem('user')).id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setHealthData(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch health data');
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height) / 100; // Convert cm to meters
    
    if (weight && height && height > 0) {
      const calculatedBMI = (weight / (height * height)).toFixed(2);
      setBmi(calculatedBMI);
      
      // Determine BMI category
      let category = '';
      const bmiValue = parseFloat(calculatedBMI);
      if (bmiValue < 18.5) {
        category = 'Underweight';
      } else if (bmiValue < 25) {
        category = 'Normal weight';
      } else if (bmiValue < 30) {
        category = 'Overweight';
      } else {
        category = 'Obese';
      }
      
      setBmiCategory(category);
    } else {
      setBmi(null);
      setBmiCategory('');
    }
  };

  const renderCharts = () => {
    // Sort health data by date
    const sortedData = [...healthData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'weight' || name === 'height') {
      setTimeout(calculateBMI, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.weight || !formData.height) {
      setError('Please enter both weight and height');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      const healthData = {
        studentId: userData.id,
        date: formData.date,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        waterIntake: formData.waterIntake ? parseFloat(formData.waterIntake) : null,
        caloriesIntake: formData.caloriesIntake ? parseFloat(formData.caloriesIntake) : null,
        bmi: bmi
      };

      const response = await axios.post('http://localhost:5000/api/healthData/add', healthData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccessMessage('Health data saved successfully!');
        fetchHealthData(token);
        
        setFormData({
          weight: '',
          height: '',
          waterIntake: '',
          caloriesIntake: '',
          date: new Date().toISOString().split('T')[0]
        });
        setBmi(null);
        setBmiCategory('');
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to save health data');
      }
    } catch (err) {
      setError('Error saving health data');
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
          Welcome, {user?.fullName}! 👋
        </h2>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Student Dashboard - Health Tracking
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px', textAlign: 'center' }}>
            📊 Daily Health Log
          </h3>
          
          {successMessage && (
            <div style={{ 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              padding: '10px', 
              borderRadius: '5px', 
              marginBottom: '15px' 
            }}>
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Weight (kg):
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Enter weight"
                  step="0.1"
                  min="0"
                  max="500"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Height (cm):
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="Enter height"
                  step="0.1"
                  min="0"
                  max="300"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Water Intake (L):
                </label>
                <input
                  type="number"
                  name="waterIntake"
                  value={formData.waterIntake}
                  onChange={handleInputChange}
                  placeholder="Enter water intake"
                  step="0.1"
                  min="0"
                  max="10"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Calories Intake:
                </label>
                <input
                  type="number"
                  name="caloriesIntake"
                  value={formData.caloriesIntake}
                  onChange={handleInputChange}
                  placeholder="Enter calories"
                  step="1"
                  min="0"
                  max="10000"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Date:
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            <button
              type="submit"
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                padding: '12px 20px', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '10px'
              }}
            >
              💾 Save Health Data
            </button>
          </form>
        </div>

        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px', textAlign: 'center' }}>
            📈 BMI Calculator
          </h3>
          
          {bmi ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#2c3e50',
                marginBottom: '10px' 
              }}>
                {bmi}
              </div>
              
              <div style={{ 
                fontSize: '20px', 
                padding: '10px 20px', 
                borderRadius: '10px',
                marginTop: '10px'
              }}>
                {bmiCategory === 'Underweight' && (
                  <div style={{ backgroundColor: '#ffc107', color: '#856404' }}>
                    ⚠️ Underweight
                  </div>
                )}
                {bmiCategory === 'Normal weight' && (
                  <div style={{ backgroundColor: '#28a745', color: 'white' }}>
                    ✅ Normal Weight
                  </div>
                )}
                {bmiCategory === 'Overweight' && (
                  <div style={{ backgroundColor: '#ffc107', color: '#856404' }}>
                    ⚠️ Overweight
                  </div>
                )}
                {bmiCategory === 'Obese' && (
                  <div style={{ backgroundColor: '#dc3545', color: 'white' }}>
                    🚨 Obese
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>
              Enter weight and height to calculate BMI
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
          � Health Progress Charts
        </h3>
        {healthData.length > 0 ? (
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
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h4>No health data available for charts</h4>
            <p>Add some health data to see your progress charts!</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
          �� Your Health Records
        </h3>
        {healthData.length > 0 ? (
          healthData.map((data, index) => (
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
            <h4>No health records found</h4>
            <p>Start by adding your daily health data above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
