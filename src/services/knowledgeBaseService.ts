import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as path from 'path';

class KnowledgeBaseService {
  private pinecone: Pinecone | null = null;
  private vectorStore: PineconeStore | null = null;
  private embeddings: OpenAIEmbeddings;
  private indexName: string = 'kc-knowledge-base';

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small'
    });
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Pinecone
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY || ''
      });

      // Get or create index
      const indexList = await this.pinecone.listIndexes();
      const indexExists = indexList.indexes?.some(index => index.name === this.indexName);

      if (!indexExists) {
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: 1536, // dimension for text-embedding-3-small
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });

        // Wait for index to be ready
        await this.waitForIndexReady();
      }

      const index = this.pinecone.index(this.indexName);
      
      // Initialize vector store
      this.vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        { 
          pineconeIndex: index,
          namespace: 'kc-content'
        }
      );

      console.log('Knowledge base service initialized successfully');
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      throw error;
    }
  }

  private async waitForIndexReady(): Promise<void> {
    const maxRetries = 30;
    let retries = 0;
    
    while (retries < maxRetries) {
      const indexList = await this.pinecone!.listIndexes();
      const index = indexList.indexes?.find(i => i.name === this.indexName);
      
      if (index?.status?.ready) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries++;
    }
    
    throw new Error('Index creation timeout');
  }

  async loadDocuments(documentsPath: string): Promise<void> {
    try {
      const documents: Document[] = [];
      
      // Check if documents directory exists
      if (!fs.existsSync(documentsPath)) {
        console.log(`Creating documents directory: ${documentsPath}`);
        fs.mkdirSync(documentsPath, { recursive: true });
        return;
      }

      // Recursively find all files from directory and subdirectories
      const findFiles = (dirPath: string, mode?: string): Array<{path: string, name: string, mode: string}> => {
        const files: Array<{path: string, name: string, mode: string}> = [];
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            // Recursively find files in subdirectory
            const folderMode = item; // cbse, kc-courses, etc.
            files.push(...findFiles(itemPath, folderMode));
          } else {
            const ext = path.extname(item).toLowerCase();
            if (ext === '.pdf' || ext === '.txt' || ext === '.md') {
              files.push({
                path: itemPath,
                name: item,
                mode: mode || 'general'
              });
            }
          }
        }
        return files;
      };

      // Find all files first
      const allFiles = findFiles(documentsPath);
      
      // Process each file
      for (const fileInfo of allFiles) {
        const ext = path.extname(fileInfo.name).toLowerCase();
        let content = '';
        let docType = '';
        
        try {
          if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(fileInfo.path);
            const pdfData = await pdfParse(dataBuffer);
            content = pdfData.text;
            docType = 'pdf';
          } else if (ext === '.txt' || ext === '.md') {
            content = fs.readFileSync(fileInfo.path, 'utf-8');
            docType = 'text';
          }
          
          // Create document with metadata including mode
          const doc = new Document({
            pageContent: content,
            metadata: {
              source: fileInfo.name,
              type: docType,
              path: fileInfo.path,
              mode: fileInfo.mode,
              folder: fileInfo.mode
            }
          });
          
          documents.push(doc);
          console.log(`Loaded: ${fileInfo.name} from ${fileInfo.mode} folder`);
        } catch (error) {
          console.error(`Error loading file ${fileInfo.name}:`, error);
        }
      }

      if (documents.length === 0) {
        console.log('No documents found to load');
        return;
      }

      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });

      const splitDocs = await textSplitter.splitDocuments(documents);
      
      // Add documents to vector store
      await this.vectorStore!.addDocuments(splitDocs);
      
      console.log(`Successfully loaded ${splitDocs.length} document chunks from ${documents.length} files`);
    } catch (error) {
      console.error('Error loading documents:', error);
      throw error;
    }
  }

  async searchKnowledge(query: string, k: number = 5): Promise<any[]> {
    try {
      if (!this.vectorStore) {
        throw new Error('Knowledge base not initialized');
      }

      // Try different similarity search methods based on what's available
      let results: Document[] = [];
      
      try {
        // Try the standard similarity search method
        results = await (this.vectorStore as any).similaritySearch(query, k);
      } catch (methodError) {
        console.log('Standard similaritySearch not available, trying alternative...');
        // Fallback to different method name if available
        if (typeof (this.vectorStore as any).search === 'function') {
          results = await (this.vectorStore as any).search(query, k);
        } else {
          throw new Error('No compatible search method found');
        }
      }
      
      return results.map((doc: Document, index: number) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        score: 1 - (index * 0.1) // Simple ranking based on order
      }));
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  async getContextForQuery(query: string, maxTokens: number = 2000): Promise<string> {
    try {
      const results = await this.searchKnowledge(query, 5);
      
      if (results.length === 0) {
        return '';
      }

      // Build context from search results
      let context = 'Relevant information from knowledge base:\n\n';
      let tokenCount = 0;
      
      for (const result of results) {
        const chunk = `[Source: ${result.metadata?.source || 'Unknown'}]\n${result.content}\n\n`;
        const estimatedTokens = chunk.length / 4; // Rough estimation
        
        if (tokenCount + estimatedTokens > maxTokens) {
          break;
        }
        
        context += chunk;
        tokenCount += estimatedTokens;
      }
      
      return context;
    } catch (error) {
      console.error('Error getting context:', error);
      return '';
    }
  }

  async clearIndex(): Promise<void> {
    try {
      if (!this.pinecone || !this.vectorStore) {
        throw new Error('Knowledge base not initialized');
      }

      const index = this.pinecone.index(this.indexName);
      await index.namespace('kc-content').deleteAll();
      
      console.log('Knowledge base cleared successfully');
    } catch (error) {
      console.error('Error clearing knowledge base:', error);
      throw error;
    }
  }
}

export default new KnowledgeBaseService();