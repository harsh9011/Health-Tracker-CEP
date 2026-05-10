require('dotenv').config();
const googleSheetsService = require('./services/googleSheetsService');

async function testGoogleSheets() {
  console.log('Testing Google Sheets integration...');
  
  try {
    // Test adding a user
    const testUser = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'student',
      age: 25,
      gender: 'male'
    };
    
    console.log('Adding test user...');
    const result = await googleSheetsService.addUser(testUser);
    console.log('User added successfully:', result);
    
    // Test getting user by email
    console.log('Getting user by email...');
    const user = await googleSheetsService.getUserByEmail('test@example.com');
    console.log('User retrieved:', user);
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testGoogleSheets();
