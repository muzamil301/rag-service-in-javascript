This is the perfect approach for a POC. Focusing on the quickest path to a working end-to-end system is the best way to validate the Agentic RAG concept and quickly leverage your existing skills.

We will stick to **PostgreSQL** for a unified DB, but for the POC, we will use the minimal **`node-postgres` (`pg` library)** directly, rather than an ORM, to reduce setup complexity.

## 📐 Overall Architecture Diagram (POC Scope)

This architecture includes all your stated requirements with the decision node logic.

### Key Components:

1.  **Frontend (React/Next.js):** Sends the user query to the NestJS API.
2.  **Backend (NestJS API):** The central orchestrator.
      * **Agent Controller:** Handles API requests.
      * **RAG Service (LangGraph):** Contains the conditional routing logic (Decide $\rightarrow$ RAG or Direct).
      * **DB Service:** Handles all PostgreSQL interactions (saving chat, running vector search).
3.  **Database (PostgreSQL + pgvector):** Stores both structured data (Chat History) and unstructured data embeddings.
4.  **Local LLM (Ollama):** Provides the language model for Classification, Generation, and Embeddings.

-----

## 📅 Project Milestones (POC)

Here is a focused, sequential plan to achieve your POC goal in the shortest time.

### MILESTONE 1: PostgreSQL & Generic DB Service (Your First Focus)

| Step | Goal | Action/Component |
| :--- | :--- | :--- |
| **1.1** | **Setup DB Environment** | Start a local PostgreSQL instance (Docker is easiest) and install the **`pgvector`** extension. |
| **1.2** | **Install Packages** | Install the PostgreSQL client: `npm install pg @langchain/community @langchain/ollama @langchain/core @langchain/langgraph`. |
| **1.3** | **Create Generic DB Service** | Implement the `DbService` NestJS Provider to handle basic PostgreSQL connection and raw query execution (CRUD). |
| **1.4** | **Define Tables** | Create two tables: `conversations` (for user chat history) and `document_vectors` (for RAG data, using the `vector` data type). |

### MILESTONE 2: Document Ingestion Pipeline

| Step | Goal | Action/Component |
| :--- | :--- | :--- |
| **2.1** | **Ingestion Service** | Create the `IngestionService` (Provider). This service uses the `JSONLoader` and `OllamaEmbeddings`. |
| **2.2** | **Tool Adaptation** | Modify the `IngestionService` to use the **`PGVectorStore`** library (from `@langchain/community`) to convert documents and save them into your `document_vectors` table via the `DbService`. |
| **2.3** | **Populate DB** | Create a temporary API endpoint (`POST /ingest`) in the `AgentController` to trigger the ingestion and populate the vector table. |

### MILESTONE 3: The Agentic RAG Core (LangGraph)

| Step | Goal | Action/Component |
| :--- | :--- | :--- |
| **3.1** | **RAG Tool Service** | Create the `RAGToolService` (Provider). This service runs the **vector search** against the `document_vectors` table using the `PGVectorStore` retriever. |
| **3.2** | **LangGraph Service** | Create the `RagService` (Provider). This service will hold the entire LangGraph workflow. |
| **3.3** | **Implement Conditional Logic** | Define the three LangGraph nodes (`classify`, `retrieve`, `generate`) and the **conditional edge** to route the query to either RAG (retrieve) or Direct Answer. |
| **3.4** | **Initial API Endpoint** | Implement the main chat endpoint in the `AgentController`: `POST /chat`. This calls `RagService.runAgent()`. |

### MILESTONE 4: Fullstack Chat Interface & History

| Step | Goal | Action/Component |
| :--- | :--- | :--- |
| **4.1** | **React Frontend** | Set up a minimal React/Next.js client. Create a simple chat input box and message display. |
| **4.2** | **Frontend Connection** | Connect the chat input to the NestJS `POST /chat` API endpoint using `fetch` or `axios`. |
| **4.3** | **Conversation History** | Enhance the `DbService` to save the user message and agent response to the `conversations` table. |
| **4.4** | **Display History** | Add a `GET /chat/history` endpoint and have the frontend fetch and display the last 10 messages from PostgreSQL on load. |

-----

## 📚 Milestone 1: PostgreSQL & Generic DB Service (Implementation)

To start, here is the minimal implementation for your generic `DbService`.

### 1\. Installation

```bash
# In your backend-agent folder:
npm install pg
```

### 2\. DbService Implementation

  * **File:** `src/db/db.service.ts` (Create a new `db` module and directory for clean separation)

<!-- end list -->

```typescript
// src/db/db.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

// NOTE: Use environment variables for production!
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'agent_poc_db', // Change this name!
  password: 'your_db_password', // Change this password!
  port: 5432,
};

@Injectable()
export class DbService implements OnModuleInit {
  private readonly logger = new Logger(DbService.name);
  private pool: Pool;

  async onModuleInit() {
    this.pool = new Pool(dbConfig);

    try {
      await this.pool.connect();
      this.logger.log('✅ Connected to PostgreSQL successfully.');
      await this.createTables();
    } catch (error) {
      this.logger.error('❌ Failed to connect to PostgreSQL.', error.stack);
      // Exit or handle fatal error gracefully
    }
  }

  // --- Generic Query Execution ---
  async query(text: string, params: any[] = []): Promise<QueryResult> {
    const start = Date.now();
    const res = await this.pool.query(text, params);
    const duration = Date.now() - start;
    this.logger.debug(`Executed query in ${duration}ms: ${text}`);
    return res;
  }

  // --- Table Creation ---
  private async createTables() {
    // Requires the 'vector' extension to be installed in your PostgreSQL DB!
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_query TEXT NOT NULL,
        agent_response TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Table for RAG embeddings
    const createVectorsTable = `
      CREATE TABLE IF NOT EXISTS document_vectors (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        source_file VARCHAR(255),
        embedding VECTOR(384) -- Dimension depends on your Ollama model (all-minilm is 384)
      );
    `;

    await this.query(createConversationsTable);
    this.logger.log('Table "conversations" checked/created.');
    
    // NOTE: This will fail if 'pgvector' is not enabled in your DB!
    await this.query(createVectorsTable);
    this.logger.log('Table "document_vectors" checked/created.');
  }

  // Graceful shutdown
  async onApplicationShutdown() {
    await this.pool.end();
    this.logger.log('PostgreSQL connection pool closed.');
  }
}
```

**Next Step:** Set up your Dockerized PostgreSQL environment and the `DbService`, and then move to Milestone 2 (Ingestion).