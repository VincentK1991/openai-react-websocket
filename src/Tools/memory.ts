import { Dispatch, SetStateAction } from 'react';

export function createSetMemoryKv(setMemoryKv: Dispatch<SetStateAction<{ [key: string]: any }>>) {
  return function(key: string, value: any) {
    setMemoryKv((prevMemoryKv) => ({
      ...prevMemoryKv,
      [key]: value
    }));
  };
}

export const memoryTool = {
  name: 'set_memory',
  description: 'Saves important data about the user into memory.',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description:
          'The key of the memory value. Always use lowercase and underscores, no other characters.',
      },
      value: {
        type: 'string',
        description: 'Value can be anything represented as a string',
      },
    },
    required: ['key', 'value'],
  },
};
