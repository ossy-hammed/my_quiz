// Import pdfjs-dist version 3.4.120
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker source
if (typeof window !== 'undefined') {
  // Use a CDN for the worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
}

interface PdfItem {
  str: string;
  [key: string]: unknown;
}

/**
 * Parse a PDF file and extract its text content
 * @param file The PDF file to parse
 * @returns A promise that resolves to the text content of the PDF
 */
export const parsePdf = async (file: File): Promise<string> => {
  try {
    console.log('Starting PDF parsing...');
    
    // Read the file as an ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    console.log('File read as ArrayBuffer, size:', arrayBuffer.byteLength);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    console.log('PDF document loaded, pages:', pdfDocument.numPages);
    
    // Extract text from all pages
    let fullText = '';
    
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      console.log(`Processing page ${i} of ${pdfDocument.numPages}`);
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text from the page
      const pageText = textContent.items
        .map((item: PdfItem) => item.str)
        .join(' ');
      
      fullText += `Page ${i}:\n${pageText}\n\n`;
    }
    
    console.log('PDF parsing completed successfully');
    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    // Try the fallback method
    try {
      console.log('Attempting fallback method...');
      return await parseWithFileReader(file);
    } catch (fallbackError) {
      console.error('Fallback method failed:', fallbackError);
      
      // Provide a detailed error message
      if (error instanceof Error) {
        throw new Error(`Failed to parse PDF file: ${error.message}`);
      }
      throw new Error('Failed to parse PDF file');
    }
  }
};

/**
 * Read a file as an ArrayBuffer
 * @param file The file to read
 * @returns A promise that resolves to an ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target || !event.target.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      resolve(event.target.result as ArrayBuffer);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Fallback method for parsing PDF files
 * @param file The PDF file to parse
 * @returns A promise that resolves to the text content of the PDF
 */
async function parseWithFileReader(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target || !event.target.result) {
          throw new Error('Failed to read file');
        }
        
        // Get the text content as a string
        const text = event.target.result.toString();
        
        // If the text is empty, throw an error
        if (!text || text.trim() === '') {
          throw new Error('Could not extract text from PDF. The file may be empty or protected.');
        }
        
        console.log('Fallback PDF parsing completed successfully');
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Try to read the file as text
    reader.readAsText(file);
  });
} 