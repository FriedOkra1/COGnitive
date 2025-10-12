import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

export async function extractTextFromDocument(filePath: string, mimeType: string): Promise<string> {
  try {
    // Handle PDF files
    if (mimeType === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    }

    // Handle DOCX files
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filePath.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    // Handle plain text files
    if (mimeType === 'text/plain' || filePath.endsWith('.txt')) {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    }

    // Handle DOC files (older Word format) - just read as text
    if (mimeType === 'application/msword' || filePath.endsWith('.doc')) {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error: any) {
    console.error('Document processing error:', error);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  }
}

export async function cleanupFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete file:', filePath, error);
  }
}

