import axios from 'axios';
import { ToolDefinition } from './toolDefinition';
import { TextArticlePairListResponse } from './toolDefinition';

export async function getTextFromKeyConcept(keyConcepts: string[]): Promise<TextArticlePairListResponse> {
    try{
        const response = await axios.post<TextArticlePairListResponse>(
            'http://localhost:8000/text_from_key_concepts/',
            { texts: keyConcepts },
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

export const TextFromKeyConceptsToolDefinition: ToolDefinition = {
    name: 'getTextFromKeyConcepts',
    description: 'retrieves the text from a list of key concepts. used to get many texts from various sources that share the same key concepts.',
    parameters: {
        type: 'object',
        properties: {
            texts: {
                type: 'array',
                description: 'The list of key concepts to get the text from such as ["test time compute","reinfocement learning"] where each string is a key concept.',
            },
        },
        required: ['texts'],
    },
};