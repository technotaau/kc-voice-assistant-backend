import * as dotenv from 'dotenv';
import * as path from 'path';
import knowledgeBaseService from '../src/services/knowledgeBaseService';

// Load environment variables
dotenv.config();

async function loadKnowledgeBase() {
  try {
    console.log('Initializing knowledge base...');
    await knowledgeBaseService.initialize();
    
    // Load documents from the documents directory
    const documentsPath = path.join(__dirname, '..', 'documents');
    console.log(`Loading documents from: ${documentsPath}`);
    
    await knowledgeBaseService.loadDocuments(documentsPath);
    
    console.log('Knowledge base loaded successfully!');
    
    // Test search
    console.log('\nTesting search functionality...');
    const testQuery = 'memory palace';
    const results = await knowledgeBaseService.searchKnowledge(testQuery, 3);
    
    if (results.length > 0) {
      console.log(`Found ${results.length} relevant results for: "${testQuery}"`);
      results.forEach((result, index) => {
        console.log(`\nResult ${index + 1}:`);
        console.log(`Source: ${result.metadata?.source || 'Unknown'}`);
        console.log(`Score: ${result.score}`);
        console.log(`Content: ${result.content.substring(0, 200)}...`);
      });
    } else {
      console.log('No results found. Please add documents to the documents directory.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    process.exit(1);
  }
}

// Run the script
loadKnowledgeBase();