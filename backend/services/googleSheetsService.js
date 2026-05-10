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

  async addUser(userData) {
    try {
      await this.initialize();
      const sheetName = await this.ensureSheetExists('Users', [
        'id', 'fullName', 'email', 'password', 'age', 'gender', 'role', 'createdAt'
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
        Date.now().toString(), // id
        userData.fullName,
        userData.email,
        userData.password, // This should be hashed
        userData.age.toString(),
        userData.gender,
        userData.role,
        new Date().toISOString()
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:H`,
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
        role: userRow[6],
        createdAt: userRow[7]
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
        role: userRow[6],
        createdAt: userRow[7]
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();
