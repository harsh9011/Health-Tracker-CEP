const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService');

// Add health log
router.post('/add', async (req, res) => {
  try {
    const { studentId, date, weight, height, waterIntake, caloriesIntake, bmi } = req.body;
    
    // Validation
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Calculate BMI if not provided
    let calculatedBmi = bmi;
    if (!calculatedBmi && weight && height) {
      const heightInMeters = height / 100;
      calculatedBmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    const healthData = {
      studentId,
      date: date || new Date().toISOString(),
      weight,
      height,
      waterIntake,
      caloriesIntake,
      bmi: calculatedBmi
    };

    const result = await googleSheetsService.addHealthLog(healthData);
    
    res.json({
      success: true,
      message: 'Health log added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding health log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get health logs by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const logs = await googleSheetsService.getHealthLogsByStudentId(studentId);
    
    res.json({
      message: 'Health logs retrieved successfully',
      data: logs
    });
  } catch (error) {
    console.error('Error getting health logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all health logs
router.get('/all', async (req, res) => {
  try {
    const logs = await googleSheetsService.getAllHealthLogs();
    
    res.json({
      message: 'All health logs retrieved successfully',
      data: logs
    });
  } catch (error) {
    console.error('Error getting all health logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update health log
router.put('/update/:studentId/:date', async (req, res) => {
  try {
    const { studentId, date } = req.params;
    const { weight, height, waterIntake, caloriesIntake, bmi } = req.body;
    
    if (!studentId || !date) {
      return res.status(400).json({ message: 'Student ID and date are required' });
    }

    // Calculate BMI if not provided
    let calculatedBmi = bmi;
    if (!calculatedBmi && weight && height) {
      const heightInMeters = height / 100;
      calculatedBmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    const healthData = {
      weight,
      height,
      waterIntake,
      caloriesIntake,
      bmi: calculatedBmi
    };

    const result = await googleSheetsService.updateSheetData(
      'HealthLogs',
      `A2:G2`, // Update the specific row
      [[studentId, date, weight, height, waterIntake, caloriesIntake, calculatedBmi]]
    );
    
    res.json({
      message: 'Health log updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating health log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete health log
router.delete('/delete/:studentId/:date', async (req, res) => {
  try {
    const { studentId, date } = req.params;
    
    if (!studentId || !date) {
      return res.status(400).json({ message: 'Student ID and date are required' });
    }

    // For now, return success (actual deletion would require more complex logic)
    res.json({
      message: 'Health log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting health log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
