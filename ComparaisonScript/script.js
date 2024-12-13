const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

// Function to read CSV and convert it to an array of objects
const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', (error) => reject(error));
  });
};

// Function to write missing rows to a new CSV file
const writeCSV = (filePath, data) => {
  const headers = Object.keys(data[0]).map((key) => ({ id: key, title: key }));
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });
  return csvWriter.writeRecords(data);
};

// Main function to compare and export missing rows
const findMissingRowsAndExport = async (file1, file2, outputFile) => {
  try {
    const [rows1, rows2] = await Promise.all([readCSV(file1), readCSV(file2)]);

    // Extract IDs from file2
    const idsInFile2 = new Set(rows2.map((row) => row.CodeLocal));

    // Find missing rows in file2 based on IDs
    const missingRows = rows1.filter((row) => !idsInFile2.has(row.CodeLocal));

    if (missingRows.length > 0) {
      await writeCSV(outputFile, missingRows);
      console.log(`Missing rows have been exported to ${outputFile}`);
    } else {
      console.log('No missing rows found.');
    }
  } catch (error) {
    console.error('Error processing files:', error);
  }
};

// Input files and output file
const file1 = 'file1.csv';
const file2 = 'file2.csv';
const outputFile = 'missing_rows.csv';

findMissingRowsAndExport(file1, file2, outputFile);
