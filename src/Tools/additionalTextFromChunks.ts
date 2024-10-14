import axios from 'axios';
import { ToolDefinition } from './toolDefinition';
import { TextArticlePairListResponse } from './toolDefinition';

export async function getAdditionalTextFromChunks(keyConcept: string): Promise<TextArticlePairListResponse> {
    try{
        const response = await axios.post<TextArticlePairListResponse>(
            'http://localhost:8000/additional_text_from_chunks/',
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

export const AdditionalTextFromKeyConceptToolDefinition: ToolDefinition = {
    name: 'getAdditionalTextFromChunks',
    description: 'Gets additional text from chunks. This is used to synthesize research from many sources, by including additional text from different articles.',
    parameters: {
        type: 'object',
        properties: {
            keyConcept: {
                type: 'string',
                description: 'The key concept such as "self correction" to get the additional text from.',
            },
        },
        required: ['keyConcept'],
    },
};