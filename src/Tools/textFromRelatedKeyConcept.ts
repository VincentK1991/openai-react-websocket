import axios from 'axios';
import { ToolDefinition } from './toolDefinition';
import { TextArticlePairListResponse } from './toolDefinition';

export async function getTextFromRelatedKeyConcept(keyConcept: string): Promise<TextArticlePairListResponse> {
    try{
        const response = await axios.post<TextArticlePairListResponse>(
        'http://localhost:8000/text_from_related_key_concepts/',
        { text: keyConcept },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error extracting text:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

export const TextFromRelatedKeyConceptsToolDefinition: ToolDefinition = {
    name: 'getTextFromRelatedKeyConcepts',
    description: 'Gets the text from related key concepts. this is used to expand the scopr of research to include related concepts not directly mentioned in the text.',
    parameters: {
        type: 'object',
        properties: {
            keyConcept: {
                type: 'string',
                description: 'The key concept such as "multimodal vision language model" to get the text from.',
            },
        },
        required: ['keyConcept'],
    },
};