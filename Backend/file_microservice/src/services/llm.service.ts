import { getChatModel, getEmbeddings } from '../config/llm';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

export const processPDF = async (pdfBuffer: Buffer) => {
  // Load PDF
  const loader = new PDFLoader(new Blob([pdfBuffer]));
  const docs = await loader.load();

  // Split text into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitDocuments(docs);

  // Create vector store
  const embeddings = getEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  return vectorStore;
};

export const generateSummary = async (
  vectorStore: MemoryVectorStore,
  query?: string
): Promise<string> => {
  const model = getChatModel();
  const prompt = PromptTemplate.fromTemplate(`
    You are an expert at summarizing documents. 
    Given the following context from a PDF document, create a comprehensive summary.
    {context}
    
    ${query ? `Focus on aspects related to: ${query}` : ''}
    
    Summary:
  `);

  const retriever = vectorStore.asRetriever();
  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const relevantDocs = await retriever.getRelevantDocuments(
          input.question
        );
        return relevantDocs.map((doc) => doc.pageContent).join('\n\n');
      },
      question: (input) => input.question,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    question: query || 'Provide a comprehensive summary of the entire document',
  });

  return result;
};