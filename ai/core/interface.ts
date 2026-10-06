/**
 * AiProvider Interface
 *
 * Abstracts AI generation capabilities.
 * Application code imports this, not the vendor SDK.
 */

export interface GenerateInput {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamInput {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface StructuredInput<T = unknown> {
  prompt: string;
  system?: string;
  schema: T; // Zod schema or JSON schema
  maxTokens?: number;
  temperature?: number;
}

export interface EmbedInput {
  text: string | string[];
}

export interface EmbedResult {
  embeddings: number[][];
}

export interface AiProvider {
  generate(input: GenerateInput): Promise<GenerateResult>;
  stream(input: StreamInput): AsyncIterable<string>;
  structured<T>(input: StructuredInput): Promise<T>;
  embed?(input: EmbedInput): Promise<EmbedResult>;
}
