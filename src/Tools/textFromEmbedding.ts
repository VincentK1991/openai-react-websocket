import axios from 'axios';
import { ToolDefinition } from './toolDefinition';
import { TextArticlePairListResponse } from './toolDefinition';

export async function getTextFromEmbedding(query:string): Promise<TextArticlePairListResponse> {
    try{
        const response = await axios.post<TextArticlePairListResponse>(
            'http://localhost:8000/text_from_chunk_embedding/',
            { text: query },
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

export const TextFromEmbeddingToolDefinition: ToolDefinition = {
    name: 'getTextFromEmbedding',
    description: 'Gets the text from an embedding query. Get direct text whose semantic meaning is most similar to the query.',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'The query text input such as "self correction by reinforcement learning" used to retrieve the text.',
            },
        },
        required: ['query'],
    },
};