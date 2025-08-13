"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const knowledgeBaseService_1 = __importDefault(require("../src/services/knowledgeBaseService"));
// Load environment variables
dotenv.config();
async function loadKnowledgeBase() {
    try {
        console.log('Initializing knowledge base...');
        await knowledgeBaseService_1.default.initialize();
        // Load documents from the documents directory
        const documentsPath = path.join(__dirname, '..', 'documents');
        console.log(`Loading documents from: ${documentsPath}`);
        await knowledgeBaseService_1.default.loadDocuments(documentsPath);
        console.log('Knowledge base loaded successfully!');
        // Test search
        console.log('\nTesting search functionality...');
        const testQuery = 'What is the memory palace technique?';
        const results = await knowledgeBaseService_1.default.searchKnowledge(testQuery, 3);
        if (results.length > 0) {
            console.log(`Found ${results.length} relevant results for: "${testQuery}"`);
            results.forEach((result, index) => {
                console.log(`\nResult ${index + 1}:`);
                console.log(`Source: ${result.metadata?.source || 'Unknown'}`);
                console.log(`Score: ${result.score}`);
                console.log(`Content: ${result.content.substring(0, 200)}...`);
            });
        }
        else {
            console.log('No results found. Please add documents to the documents directory.');
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error loading knowledge base:', error);
        process.exit(1);
    }
}
// Run the script
loadKnowledgeBase();
