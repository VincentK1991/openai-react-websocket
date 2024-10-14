import axios from 'axios';
import { ToolDefinition } from './toolDefinition';
import { TextResponse } from './toolDefinition';

export async function resolveKeyConcepts(): Promise<string> {
  try {
    const response = await axios.post<TextResponse>(
      'http://localhost:8000/keyconcepts_resolution/',
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

export const KeyConceptResolutionToolDefinition: ToolDefinition = {
    name: 'resolveKeyConcepts',
    description: 'Resolves the key concepts in the text.',
    parameters: {
        type: 'object',
        properties: {},
        required: [],
    },
};