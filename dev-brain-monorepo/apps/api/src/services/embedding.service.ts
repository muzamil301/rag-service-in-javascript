import ollama from 'ollama';

const embeddingModel = 'all-minilm';
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await ollama.embeddings({
    model: embeddingModel,
    prompt: text,
  });

  return response.embedding;
};