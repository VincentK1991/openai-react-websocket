interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      [key: string]: {
        type: string;
        description: string;
      };
    };
    required: string[];
  };
}

export interface TextArticlePairResponse {
  text: string;
  article_title: string;
}

export interface TextArticlePairListResponse {
  results: TextArticlePairResponse[];
}

export interface TextResponse {
  text: string;
}

export type { ToolDefinition };