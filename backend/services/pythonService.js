import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Call Python model service to analyze PDF and generate highlighted report
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} documentId - Document ID for saving the report
 * @returns {Promise<{reportPath: string, analysis: object}>}
 */
export const generatePDFReport = async (pdfPath, documentId) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../python/model_service.py');
    const reportsDir = path.join(__dirname, '../reports');
    
    // Ensure reports directory exists
    fs.mkdir(reportsDir, { recursive: true }).catch(console.error);

    const outputPath = path.join(reportsDir, `report-${documentId}.pdf`);

    // Call Python script
    const pythonProcess = spawn('python', [
      pythonScript,
      '--input', pdfPath,
      '--output', outputPath,
      '--document_id', documentId,
    ]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`Error: ${stderr}`);
        reject(new Error(`Python model failed: ${stderr || 'Unknown error'}`));
        return;
      }

      // Check if output file exists
      fs.access(outputPath)
        .then(() => {
          resolve({
            reportPath: outputPath,
            success: true,
          });
        })
        .catch((err) => {
          reject(new Error(`Generated report file not found: ${err.message}`));
        });
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(new Error(`Failed to start Python service: ${error.message}`));
    });
  });
};

/**
 * Analyze PDF using Python model and return analysis results
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<object>} Analysis results
 */
export const analyzeWithModel = async (pdfPath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../python/model_service.py');
    
    const pythonProcess = spawn('python', [
      pythonScript,
      '--input', pdfPath,
      '--analyze_only',
    ]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python model analysis failed: ${stderr || 'Unknown error'}`));
        return;
      }

      try {
        // Parse JSON output from Python script
        const lines = stdout.trim().split('\n');
        const jsonLine = lines.find(line => line.startsWith('{') || line.startsWith('['));
        
        if (jsonLine) {
          const analysis = JSON.parse(jsonLine);
          resolve(analysis);
        } else {
          reject(new Error('No valid JSON output from Python model'));
        }
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error.message}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python service: ${error.message}`));
    });
  });
};

