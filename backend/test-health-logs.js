require('dotenv').config();
const googleSheetsService = require('./services/googleSheetsService');

async function testHealthLogs() {
  console.log('Testing HealthLogs functionality...');
  
  try {
    // Test adding a health log
    const healthData = {
      studentId: '1778404790607', // Using existing user ID
      date: new Date().toISOString(),
      weight: 70,
      height: 175,
      waterIntake: 8,
      caloriesIntake: 2000,
      bmi: 22.9
    };

    console.log('Adding health log:', healthData);
    const addResult = await googleSheetsService.addHealthLog(healthData);
    console.log('Health log added:', addResult);

    // Test getting health logs by student ID
    console.log('Getting health logs by student ID...');
    const logsByStudent = await googleSheetsService.getHealthLogsByStudentId('1778404790607');
    console.log('Health logs by student:', logsByStudent);

    // Test getting all health logs
    console.log('Getting all health logs...');
    const allLogs = await googleSheetsService.getAllHealthLogs();
    console.log('All health logs:', allLogs);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testHealthLogs();
