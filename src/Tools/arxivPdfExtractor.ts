import axios from 'axios';

interface ExtractTextResponse {
  text: string;
}

export async function extractTextFromArxivPDF(arxivUrl: string): Promise<string> {
  try {
    const response = await axios.post<ExtractTextResponse>(
      'http://localhost:8000/extract_text/',
      { url: arxivUrl },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.text;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error extracting text:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}



export const PdfExtractorToolDefinition = {
    name: 'extractArxivText',
    description: 'Extracts text content from an arXiv PDF given the URL of the arXiv abstract page.',
    parameters: {
      type: 'object',
      properties: {
        arxivUrl: {
            type: 'string',
            description: 'The URL of the arXiv abstract page (e.g., https://arxiv.org/abs/1234.5678).',
        },
      },
      required: ['arxivUrl'],
    },
  };