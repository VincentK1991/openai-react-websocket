import { useCallback } from 'react';

const BACKEND_URL = 'http://localhost:8000';

export function useMongoSave() {
  const saveToMongo = useCallback(async (data: any) => {
    try {
      const response = await fetch(`${BACKEND_URL}/save-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save interaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving interaction:', error);
      throw error;
    }
  }, []);

  return { saveToMongo };
}