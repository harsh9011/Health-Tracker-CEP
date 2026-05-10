require('dotenv').config();
const axios = require('axios');

async function testRegistration() {
  console.log('Testing registration endpoint...');
  
  try {
    const userData = {
      fullName: 'Test User',
      email: 'test4@example.com',
      password: 'password123',
      role: 'student',
      age: 25,
      gender: 'male'
    };

    console.log('Sending registration request:', userData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Registration successful:', response.data);
    
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testRegistration();
