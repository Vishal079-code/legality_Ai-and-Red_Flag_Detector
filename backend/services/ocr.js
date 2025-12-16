import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import mammoth from 'mammoth';

/**
 * Extract text from PDF using pdf-parse (for text-based PDFs)
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

/**
 * Extract text from image using Tesseract.js OCR
 */
const extractTextFromImage = async (filePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    return text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
};

/**
 * Extract text from DOCX using mammoth
 */
const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw error;
  }
};

/**
 * Main OCR function that handles different file types
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Extracted text
 */
export const extractText = async (filePath, mimeType) => {
  try {
    let text = '';

    if (mimeType === 'application/pdf') {
      // Try pdf-parse first (faster for text PDFs)
      try {
        text = await extractTextFromPDF(filePath);
        // If pdf-parse returns very little text, it might be a scanned PDF
        if (text.trim().length < 100) {
          console.log('PDF appears to be scanned, trying OCR...');
          text = await extractTextFromImage(filePath);
        }
      } catch (error) {
        console.log('pdf-parse failed, trying OCR...');
        text = await extractTextFromImage(filePath);
      }
    } else if (mimeType.startsWith('image/')) {
      text = await extractTextFromImage(filePath);
    } else if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      text = await extractTextFromDOCX(filePath);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    return text.trim();
  } catch (error) {
    console.error('Error in extractText:', error);
    throw error;
  }
};


