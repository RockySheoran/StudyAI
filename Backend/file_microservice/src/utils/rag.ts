import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { getEmbeddings } from '../config/llm';

/**
 * Processes text content into vector store for RAG
 * @param {string} content - The text content to process
 * @param {object} options - Processing options
 * @param {number} [options.chunkSize=1000] - Size of text chunks
 * @param {number} [options.chunkOverlap=200] - Overlap between chunks
 * @returns {Promise<MemoryVectorStore>} Vector store with embedded documents
 */
export const createVectorStoreFromText = async (
  content: string,
  options: { chunkSize?: number; chunkOverlap?: number } = {}
): Promise<MemoryVectorStore> => {
  const { chunkSize = 1000, chunkOverlap = 200 } = options;

  // Split text into documents
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const docs = await splitter.createDocuments([content]);

  // Create vector store
  const embeddings = getEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  return vectorStore;
};

/**
 * Processes multiple documents into a vector store for RAG
 * @param {Document[]} documents - Array of LangChain documents
 * @returns {Promise<MemoryVectorStore>} Vector store with embedded documents
 */
export const createVectorStoreFromDocuments = async (
  documents: Document[]
): Promise<MemoryVectorStore> => {
  const embeddings = getEmbeddings();
  return await MemoryVectorStore.fromDocuments(documents, embeddings);
};

/**
 * Performs similarity search on a vector store
 * @param {MemoryVectorStore} vectorStore - The vector store to search
 * @param {string} query - The search query
 * @param {number} [k=4] - Number of results to return
 * @returns {Promise<Document[]>} Relevant documents
 */
export const searchVectorStore = async (
  vectorStore: MemoryVectorStore,
  query: string,
  k: number = 4
): Promise<Document[]> => {
  return await vectorStore.similaritySearch(query, k);
};

/**
 * Creates a retriever from a vector store
 * @param {MemoryVectorStore} vectorStore - The vector store to use
 * @param {number} [k=4] - Number of results to return
 * @returns {Retriever} A retriever instance
 */
export const createRetriever = (
  vectorStore: MemoryVectorStore,
  k: number = 4
) => {
  return vectorStore.asRetriever(k);
};

/**
 * Processes PDF text content with metadata into vector store
 * @param {string} text - PDF text content
 * @param {Record<string, any>} metadata - Document metadata
 * @returns {Promise<MemoryVectorStore>} Vector store with embedded documents
 */
export const processPDFContent = async (
  text: string,
  metadata: Record<string, any> = {}
): Promise<MemoryVectorStore> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text], [metadata]);
  return await createVectorStoreFromDocuments(docs);
};

/**
 * Enhanced RAG pipeline that handles document processing and retrieval
 * @param {string | Document[]} content - Either text content or pre-processed documents
 * @param {object} [options] - Configuration options
 * @returns {Promise<{retriever: Retriever, vectorStore: MemoryVectorStore}>} RAG components
 */
export const setupRAGPipeline = async (
  content: string | Document[],
  options: { chunkSize?: number; chunkOverlap?: number } = {}
) => {
  let vectorStore: MemoryVectorStore;

  if (typeof content === 'string') {
    vectorStore = await createVectorStoreFromText(content, options);
  } else {
    vectorStore = await createVectorStoreFromDocuments(content);
  }

  const retriever = createRetriever(vectorStore);
  return { retriever, vectorStore };
};