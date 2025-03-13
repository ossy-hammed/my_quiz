// This is a test script to verify that our PDF parser works correctly
// Run this with Node.js to test the PDF parser without the browser

const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist');

// Disable worker to avoid external dependencies
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

async function testPdfParser(pdfPath) {
  try {
    console.log(`Testing PDF parser with file: ${pdfPath}`);
    
    // Read the PDF file
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    
    // Create a new PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: data,
      disableWorker: true, // Disable worker to avoid external dependencies
      disableRange: true,
      disableStream: true,
      isEvalSupported: false
    });
    
    console.log('PDF loading task created');
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    // Get the total number of pages
    const numPages = pdf.numPages;
    
    // Extract text from each page
    let fullText = '';
    
    for (let i = 1; i <= numPages; i++) {
      console.log(`Processing page ${i} of ${numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Join all the text items from the page
      const pageText = textContent.items
        .filter((item) => item.str && item.str.trim() !== '')
        .map((item) => item.str)
        .join(' ');
      
      fullText += `Page ${i}:\n${pageText}\n\n`;
    }
    
    console.log('PDF parsing completed successfully');
    console.log('Extracted text sample:', fullText.substring(0, 200) + '...');
    return fullText;
  } catch (error) {
    console.error('Error in PDF parsing:', error);
    throw error;
  }
}

// Check if a file path was provided
if (process.argv.length < 3) {
  console.log('Usage: node testPdfParser.js <path-to-pdf-file>');
  process.exit(1);
}

// Get the PDF file path from command line arguments
const pdfPath = process.argv[2];

// Run the test
testPdfParser(pdfPath)
  .then(() => {
    console.log('Test completed successfully');
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 