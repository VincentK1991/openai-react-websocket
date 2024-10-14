import axios from 'axios';
import { ToolDefinition } from './toolDefinition';
import { TextResponse } from './toolDefinition';

export async function extractTextToNeo4j(arxivUrl: string): Promise<string> {
  try {
    const response = await axios.post<TextResponse>(
      'http://localhost:8000/paper_extraction_to_neo4j/',
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



export const ExtractorToNeo4jToolDefinition: ToolDefinition = {
    name: 'extractTextToNeo4j',
    description: 'Extracts text content from an arXiv PDF given the URL of the arXiv abstract page and extracts it to graph database in neo4j.',
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