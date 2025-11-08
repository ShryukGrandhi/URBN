import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

export async function parsePDF(filepath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filepath);
    const data = await pdfParse(dataBuffer);
    
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
}

export function cleanPDFText(text: string): string {
  // Remove extra whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Remove page numbers
  cleaned = cleaned.replace(/\b\d+\s*$/gm, '');
  
  // Normalize line breaks
  cleaned = cleaned.replace(/\r\n/g, '\n');
  
  return cleaned;
}


