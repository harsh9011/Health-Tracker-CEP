const { google } = require('googleapis');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (this.initialized) return;

      const auth = new google.auth.GoogleAuth({
        keyFile: './google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const authClient = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
      this.initialized = true;
      console.log('Google Sheets service initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Sheets service:', error);
      throw error;
    }
  }

  async ensureSheetExists(sheetName, headers) {
    try {
      await this.initialize();
      
      // Get spreadsheet info to check if sheet exists
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheet = response.data.sheets.find(s => 
        s.properties.title === sheetName
      );

      if (!sheet) {
        // Create new sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 20
                  }
                }
              }
            }]
          }
        });

        // Add headers
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers]
          }
        });
      }

      return sheetName;
    } catch (error) {
      console.error(`Error ensuring sheet ${sheetName} exists:`, error);
      throw error;
    }
  }

  // Users Sheet Methods
  async addUser(userData) {
    try {
      await this.initialize();
      const sheetName = await this.ensureSheetExists('Users', [
        'ID', 'Name', 'Email', 'Password', 'Age', 'Gender', 'Role'
      ]);

      // Check if user already exists
      const existingUserResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      const rows = existingUserResponse.data.values || [];
      const emailColumnIndex = 2; // Email is in column C (index 2)
      
      const existingUser = rows.find(row => row[emailColumnIndex] === userData.email);
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Add new user
      const newUser = [
        Date.now().toString(), // ID
        userData.fullName,
        userData.email,
        userData.password, // This should be hashed
        userData.age.toString(),
        userData.gender,
        userData.role
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:F`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [newUser]
        }
      });

      return { id: newUser[0], ...userData, password: undefined };
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      await this.initialize();
      const sheetName = 'Users';

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      const rows = response.data.values || [];
      const emailColumnIndex = 2; // Email is in column C (index 2)
      
      const userRow = rows.find(row => row[emailColumnIndex] === email);
      
      if (!userRow) {
        return null;
      }

      return {
        id: userRow[0],
        fullName: userRow[1],
        email: userRow[2],
        password: userRow[3],
        age: userRow[4],
        gender: userRow[5],
        role: userRow[6]
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      await this.initialize();
      const sheetName = 'Users';

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      const rows = response.data.values || [];
      const idColumnIndex = 0; // ID is in column A (index 0)
      
      const userRow = rows.find(row => row[idColumnIndex] === id);
      
      if (!userRow) {
        return null;
      }

      return {
        id: userRow[0],
        fullName: userRow[1],
        email: userRow[2],
        age: userRow[4],
        gender: userRow[5],
        role: userRow[6]
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // HealthLogs Sheet Methods
  async addHealthLog(healthData) {
    try {
      await this.initialize();
      const sheetName = await this.ensureSheetExists('HealthLogs', [
        'Student ID', 'Date', 'Weight', 'Height', 'Water Intake', 'Calories Intake', 'BMI'
      ]);

      // Add new health log
      const newLog = [
        healthData.studentId,
        healthData.date || new Date().toISOString(),
        healthData.weight?.toString() || '',
        healthData.height?.toString() || '',
        healthData.waterIntake?.toString() || '',
        healthData.caloriesIntake?.toString() || '',
        healthData.bmi?.toString() || ''
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:G`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [newLog]
        }
      });

      return { success: true, message: 'Health log added successfully' };
    } catch (error) {
      console.error('Error adding health log:', error);
      throw error;
    }
  }

  async getHealthLogsByStudentId(studentId) {
    try {
      await this.initialize();
      const sheetName = 'HealthLogs';

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:G`,
      });

      const rows = response.data.values || [];
      const studentIdColumnIndex = 0; // Student ID is in column A (index 0)
      
      const studentLogs = rows.filter(row => row[studentIdColumnIndex] === studentId);
      
      return studentLogs.map(row => ({
        studentId: row[0],
        date: row[1],
        weight: row[2],
        height: row[3],
        waterIntake: row[4],
        caloriesIntake: row[5],
        bmi: row[6]
      }));
    } catch (error) {
      console.error('Error getting health logs by student ID:', error);
      throw error;
    }
  }

  async getAllHealthLogs() {
    try {
      await this.initialize();
      const sheetName = 'HealthLogs';

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:G`,
      });

      const rows = response.data.values || [];
      
      return rows.map(row => ({
        studentId: row[0],
        date: row[1],
        weight: row[2],
        height: row[3],
        waterIntake: row[4],
        caloriesIntake: row[5],
        bmi: row[6]
      }));
    } catch (error) {
      console.error('Error getting all health logs:', error);
      throw error;
    }
  }

  // Utility Methods
  async getSheetData(sheetName, range = 'A:Z') {
    try {
      await this.initialize();
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!${range}`,
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`Error getting sheet data for ${sheetName}:`, error);
      throw error;
    }
  }

  async updateSheetData(sheetName, range, values) {
    try {
      await this.initialize();
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values
        }
      });

      return { success: true, message: 'Data updated successfully' };
    } catch (error) {
      console.error(`Error updating sheet data for ${sheetName}:`, error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      await this.initialize();
      const sheetName = 'Users';
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:G`,
      });

      const rows = response.data.values || [];
      const headers = rows[0];
      const users = [];

      for (let i = 1; i < rows.length; i++) {
        const user = {};
        headers.forEach((header, index) => {
          const key = header.toLowerCase().replace(/\s+/g, '');
          user[key] = rows[i][index];
        });
        users.push(user);
      }

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();
