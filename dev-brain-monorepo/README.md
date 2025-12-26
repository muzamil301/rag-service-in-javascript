# 🧠 DevBrain AI: Agentic Wiki Assistant

DevBrain is a high-performance **Agentic RAG (Retrieval-Augmented Generation)** system built to serve as an internal technical assistant. Unlike traditional chatbots, DevBrain uses a **State Graph** to reason about user intent, deciding dynamically whether to query internal documentation or provide a general response.

---

## 🚀 Tech Stack

- **Monorepo:** [Turborepo](https://turbo.build/) (Managing `apps/api`, `apps/web`, and `packages/ai-engine`).
- **Orchestration:** [LangGraph](https://langchain-ai.github.io/langgraph/) (Stateful, multi-node agent logic).
- **LLM Engine:** [Ollama](https://ollama.com/) (Local **Llama 3**).
- **Vector Database:** [PostgreSQL with pgvector](https://github.com/pgvector/pgvector) (Semantic search for `.md` docs).
- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router, Tailwind CSS, SSE Streaming).
- **Backend:** [Node.js / Express](https://expressjs.com/) (Server-Sent Events for real-time agent "thoughts").

---

## 🏗 System Architecture

The "Brain" is structured as a state machine. Every request flows through a directed graph to ensure high precision and low latency.



### Core Nodes:
1.  **`classifyNode`**: Uses **Few-Shot Prompting** to determine if a query is `WIKI` (internal knowledge) or `GENERAL` (greetings/common code).
2.  **`retrieveNode`**: Triggers a semantic search against the `pgvector` database only when necessary.
3.  **`generatorNode`**: Synthesizes the final response using retrieved context and full conversation history.
4.  **`Persistence`**: Uses a `thread_id` and `MemorySaver` to provide the agent with a "short-term memory" of the current session.

---

## 📂 Project Structure

```text
.
├── apps
│   ├── api          # Express server: Handles SSE, Routing, and Vector DB
│   └── web          # Next.js app: Real-time UI with Stream Readers
├── packages
│   ├── ai-engine    # LangGraph workflow, State definitions, and Nodes
│   ├── database     # pgvector schema and embedding generation scripts
│   └── tsconfig     # Shared TypeScript configurations


🛠 Installation & Setup
1. Prerequisites
Node.js: v18+

pnpm: npm install -g pnpm

Ollama: Download here and run ollama run llama3.

Docker: For running PostgreSQL with pgvector.

2. Environment Variables
Create a .env file in the root of the project:

Fragment kodu

DATABASE_URL="postgresql://user:password@localhost:5432/devbrain"
NEXT_PUBLIC_API_URL="http://localhost:3001"
OLLAMA_BASE_URL="http://localhost:11434"
3. Installation
Bash

pnpm install
4. Database & Embeddings
Ensure your Postgres container is active, then initialize the vector store and seed it with your markdown files:

Bash

# Push schema to DB
pnpm --filter @dev-brain/database db:push

# Generate embeddings and seed Vector DB
pnpm --filter @dev-brain/database db:seed
🚀 Running the App
Start Development Mode
Turborepo will run the API and Web Frontend in parallel:

Bash

pnpm dev
Web UI: http://localhost:3000

API Backend: http://localhost:3001

🧪 Testing & Debugging
Agent Dry Run (Logic Test)
Test the routing and generation logic in the terminal without the frontend:

Bash

pnpm --filter @dev-brain/ai-engine test:dry
Manual Stream Test (cURL)
Verify Server-Sent Events (SSE) and binary decoding:

Bash

curl -N -X POST http://localhost:3001/chat/stream \
-H "Content-Type: application/json" \
-d '{ "message": "Where is the checkout flow?", "threadId": "session-unique-id" }'
💡 Key Principles
Intent-Based Routing: Avoids unnecessary DB calls by classifying queries first.

Binary Streaming: Uses Uint8Array chunks via TextDecoder on the frontend for low-latency UI updates.

Thread Isolation: Uses UUIDs to manage separate conversation histories via LangGraph checkpointers.