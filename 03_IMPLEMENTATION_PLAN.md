# SuperMentor AI – Implementation Plan

**Version:** 1.0  
**Timeline:** 5 Weeks to MVP  
**Target Launch:** End of Week 5  
**Team Size:** 2–3 engineers (1 backend, 1 frontend, 1 optional DevOps/QA)  
**Status:** Ready for Sprint Planning

---

## Overview

This document breaks down the 5-week development timeline into **daily standups + sprint deliverables**. Each week builds on the previous one, with dependencies clearly marked.

### Week Structure

- **Day 1–4:** Heads-down development, daily 15-min standup
- **Day 5:** Demo to stakeholders, sprint retrospective, plan next week
- **Weekend:** On-call fixes, documentation catch-up (no new features)

---

## Week 1: Foundation & Authentication (Days 1–5)

**Goal:** Ship working UI + backend scaffolding + Clerk auth. Students can sign up, log in, and see dashboard (empty).

**Success Criteria:**
- User can sign up via email/Google
- Sessions persist across page reloads
- Dashboard loads (no data yet)
- Backend API running and documented
- Local dev environment works (one command)

### Week 1 Detailed Breakdown

#### **Day 1 (Monday): Project Setup**

**Frontend:**
- [ ] Initialize Next.js 15 app with App Router
- [ ] Set up Tailwind CSS, Shadcn UI, Framer Motion
- [ ] Create folder structure (`/app`, `/components`, `/lib`)
- [ ] Install Clerk, Zustand, TanStack Query, Axios
- [ ] Set up ESLint + Prettier
- [ ] Create `.env.example` with all required keys

**Backend:**
- [ ] Initialize FastAPI project
- [ ] Set up folder structure (`/app/routers`, `/app/models`, `/app/services`)
- [ ] Configure Convex client (create free project)
- [ ] Set up logging, error handling
- [ ] Create `main.py` with health check endpoint
- [ ] Set up requirements.txt, `.env.example`

**DevOps:**
- [ ] Create `docker-compose.local.yml` for Redis, optional Ollama
- [ ] Write `Makefile` or `start.sh` for one-command dev setup
- [ ] Add GitHub Actions workflow template

**Documentation:**
- [ ] Create `/docs` folder
- [ ] Add `CONTRIBUTING.md`, `SETUP.md` for local development
- [ ] Create issue templates for bug reports / features

**Deliverable:** Repository structure, reproducible local dev environment.

**Standup Checklist:**
- [ ] Can you run `make dev` and see both frontend + backend running?
- [ ] Can you sign up via Clerk?
- [ ] Are git commits following the convention?

---

#### **Day 2 (Tuesday): Authentication & User Profile**

**Frontend:**
- [ ] Integrate Clerk sign-up/login flow
- [ ] Create `ClerkProvider` wrapper for the app
- [ ] Build login page (email + OAuth buttons)
- [ ] Build signup page with email verification
- [ ] Create protected route wrapper (`ProtectedRoute`)
- [ ] Add logout button to navbar
- [ ] Create user profile page skeleton (name, email, picture)

**Backend:**
- [ ] Create `/api/auth/me` endpoint (returns current user from Clerk)
- [ ] Create `/api/auth/verify` endpoint (verifies Clerk token)
- [ ] Add middleware for Clerk token verification to all routes
- [ ] Set up error handling for auth failures (401, 403)
- [ ] Create user role enum (student, teacher, admin)

**Convex:**
- [ ] Define `users` table schema
  ```javascript
  export const users = defineTable({
    clerkId: v.string(),           // Unique Clerk user ID
    email: v.string(),
    displayName: v.string(),
    role: v.union(v.literal("student"), v.literal("teacher"), v.literal("admin")),
    preferences: v.object({
      theme: v.string(),
      language: v.string(),
      voiceEnabled: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"])
  ```
- [ ] Create mutation to upsert user on signup
- [ ] Create query to fetch user by Clerk ID

**Deliverable:** Users can sign up, log in, log out. Dashboard loads (empty state).

**Standup Checklist:**
- [ ] Can you sign up with email and receive verification?
- [ ] Can you sign up with Google OAuth?
- [ ] Does `/api/auth/me` return your user data?
- [ ] Are profile pages showing correct user info?

---

#### **Day 3 (Wednesday): Dashboard Layout & Navigation**

**Frontend:**
- [ ] Build main dashboard layout (sidebar nav + main content area)
- [ ] Create nav items: Dashboard, Upload, Knowledge Base, Quiz, Flashcards, Analytics, Settings
- [ ] Build responsive mobile nav (hamburger menu)
- [ ] Create empty state for each page
- [ ] Add breadcrumb navigation
- [ ] Style dark/light mode toggle (Shadcn UI built-in)
- [ ] Build settings page (language, voice toggle, theme, email preferences)

**Backend:**
- [ ] No new endpoints needed yet (just health check + auth)

**Convex:**
- [ ] Add `settings` table (optional, can mirror in `users.preferences`)

**Testing:**
- [ ] Manual testing: Navigate to each page, check responsive layout

**Deliverable:** Fully navigable dashboard. Each page loads but shows "Coming soon" placeholder.

**Standup Checklist:**
- [ ] Can you navigate between all sections?
- [ ] Is layout responsive on mobile?
- [ ] Does dark mode toggle work?

---

#### **Day 4 (Thursday): File Upload UI & Validation**

**Frontend:**
- [ ] Build upload center page
- [ ] Create drag-and-drop file input (React Drop Zone or custom)
- [ ] Add file type validation (PDF, PPTX, DOCX, TXT, transcripts)
- [ ] Show file size warnings (>50MB not allowed)
- [ ] Build upload progress indicator (fake progress for now)
- [ ] Display uploaded files list (mock data)
- [ ] Add delete button for each file (no-op for now)
- [ ] Create file details modal (name, size, upload date, chunk count)

**Backend:**
- [ ] Create `/api/documents/upload` endpoint (receives file, returns ID)
- [ ] Store file metadata in Convex (name, size, mime type, owner, status)
- [ ] Add file size validation (reject >50MB)
- [ ] Implement file storage layer abstraction
  ```python
  # storage/base.py
  class StorageProvider:
      async def upload(self, file: bytes, user_id: str, filename: str) -> str:
          """Returns storage URL"""
  
  # storage/local.py
  class LocalStorageProvider(StorageProvider):
      async def upload(self, file: bytes, user_id: str, filename: str) -> str:
          # Save to ./uploads/{user_id}/{filename}
          # Return file path
  ```
- [ ] Create `/api/documents` endpoint (list user's documents)
- [ ] Add parsing status field to document schema (pending, parsing, ready, failed)

**Convex:**
- [ ] Define `documents` table schema
  ```javascript
  export const documents = defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    fileType: v.string(),  // pdf, pptx, docx, txt
    fileSize: v.number(),  // bytes
    storageUrl: v.string(), // local path or CDN URL
    parseStatus: v.union(
      v.literal("pending"),
      v.literal("parsing"),
      v.literal("ready"),
      v.literal("failed")
    ),
    chunkCount: v.number(),
    errorMessage: v.optional(v.string()),
    uploadedAt: v.number(),
  }).index("by_user_id", ["userId"])
  ```

**Testing:**
- [ ] Upload a PDF file, verify it appears in list
- [ ] Try uploading oversized file, verify rejection
- [ ] Try uploading unsupported format, verify rejection

**Deliverable:** Users can upload files. Files appear in list. Backend validates and stores metadata.

**Standup Checklist:**
- [ ] Can you upload a PDF?
- [ ] Does the file appear in the list?
- [ ] Are validation errors shown clearly?
- [ ] Is `/api/documents` returning correct list?

---

#### **Day 5 (Friday): Demo & Sprint Retrospective**

**Demo (30 min):**
- Sign up flow
- Dashboard navigation
- File upload interface
- Settings page

**Retrospective (30 min):**
- What went well? (fast setup, Clerk easy to integrate, etc.)
- What slowed us down? (Convex learning curve? Shadcn UI setup?)
- Adjust process for Week 2

**End-of-Week Checklist:**
- [ ] All code committed to `main` branch
- [ ] README.md updated with setup instructions
- [ ] No console errors in browser or backend
- [ ] Health check endpoint returns `{"status": "ok"}`

---

## Week 2: RAG Pipeline & Chat Core (Days 6–10)

**Dependency:** Week 1 complete (auth, upload UI, document metadata storage)

**Goal:** Ship document parsing → chunking → embedding → vector search → chat interface. Users can upload a PDF and ask questions about it (grounded answers).

**Success Criteria:**
- Upload a PDF
- Ask a question about its content
- Receive a grounded answer with citation within 4 seconds
- Answer is retrieved from document (not hallucinated)
- Chat history persists

### Week 2 Detailed Breakdown

#### **Day 6 (Monday): Document Parsing Pipeline**

**Backend:**
- [ ] Install parsing libraries: `pdfplumber`, `python-pptx`, `python-docx`
- [ ] Create parsing services
  ```python
  # backend/services/parsers.py
  class DocumentParser:
      async def parse_pdf(self, file_bytes: bytes) -> str:
          # Extract text while preserving structure
      
      async def parse_pptx(self, file_bytes: bytes) -> str:
          # Extract slide text in order
      
      async def parse_docx(self, file_bytes: bytes) -> str:
          # Extract text and preserve headings
      
      async def parse_transcript(self, file_bytes: bytes) -> str:
          # Handle plain text transcripts
  
  # Dispatch to correct parser
  async def parse_document(self, file_bytes: bytes, mime_type: str) -> str:
      if mime_type == "application/pdf":
          return await self.parse_pdf(file_bytes)
      # ... etc
  ```
- [ ] Create `/api/documents/{docId}/parse` endpoint
  - Validates document exists and belongs to user
  - Parses file, extracts raw text
  - Updates document status to "parsing"
  - Triggers async parsing job

**Task Queue (Celery + Redis):**
- [ ] Set up Celery + Redis for async jobs
- [ ] Create task: `parse_and_embed_document`
  - Receives document ID
  - Reads file from storage
  - Parses into chunks
  - Generates embeddings
  - Stores in ChromaDB
  - Updates document status to "ready"
  - Logs errors if any step fails

**Deliverable:** Upload a document → parsing begins → status updates to "ready" once complete.

**Standup Checklist:**
- [ ] Upload PDF, watch status change from "pending" → "parsing" → "ready"
- [ ] Celery worker processes the task
- [ ] No errors in task logs

---

#### **Day 7 (Tuesday): Chunking & Embedding**

**Backend:**
- [ ] Create chunking service
  ```python
  # backend/services/chunker.py
  class DocumentChunker:
      def __init__(self, chunk_size: int = 500, overlap: int = 100):
          self.chunk_size = chunk_size
          self.overlap = overlap
      
      def chunk_text(self, text: str) -> list[str]:
          # Split by sentence first, then merge into chunks
          # Maintain overlap for context
          sentences = text.split(". ")
          chunks = []
          current_chunk = ""
          
          for sentence in sentences:
              if len(current_chunk) + len(sentence) < self.chunk_size:
                  current_chunk += sentence + ". "
              else:
                  if current_chunk:
                      chunks.append(current_chunk)
                  current_chunk = sentence + ". "
          
          if current_chunk:
              chunks.append(current_chunk)
          
          return chunks
  ```
- [ ] Integrate with parsing pipeline

**Embeddings:**
- [ ] Set up Sentence Transformers locally
  ```python
  # backend/services/embedding.py
  from sentence_transformers import SentenceTransformer
  
  class EmbeddingService:
      def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
          self.model = SentenceTransformer(model_name)
      
      async def embed_text(self, text: str) -> list[float]:
          return self.model.encode(text, convert_to_numpy=True).tolist()
      
      async def embed_batch(self, texts: list[str]) -> list[list[float]]:
          return self.model.encode(texts, convert_to_numpy=True).tolist()
  ```
- [ ] Test with local Sentence Transformers model (22MB, runs on CPU)

**Vector Database:**
- [ ] Initialize ChromaDB locally
  ```python
  # backend/db/chromadb.py
  import chromadb
  from chromadb.config import Settings
  
  settings = Settings(
      chroma_db_impl="duckdb+parquet",
      persist_directory="./data/chroma",
      anonymized_telemetry=False,
  )
  
  client = chromadb.Client(settings)
  
  def get_or_create_collection(user_id: str):
      return client.get_or_create_collection(
          name=f"user_{user_id}",
          metadata={"user_id": user_id}
      )
  ```
- [ ] Create functions to add embeddings to ChromaDB
  ```python
  async def add_chunks_to_vector_store(
      user_id: str, 
      doc_id: str, 
      chunks: list[str], 
      embeddings: list[list[float]]
  ):
      collection = get_or_create_collection(user_id)
      collection.add(
          ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
          embeddings=embeddings,
          documents=chunks,
          metadatas=[{"doc_id": doc_id, "chunk_index": i} for i in range(len(chunks))]
      )
  ```

**Testing:**
- [ ] Upload PDF → chunks created
- [ ] Chunks embeddings in ChromaDB
- [ ] Verify embedding dimension (384 for MiniLM)

**Deliverable:** Documents are parsed, chunked, and embedded. Vectors stored in ChromaDB.

**Standup Checklist:**
- [ ] Document parsing completes without errors
- [ ] Can you inspect chunks in ChromaDB?
- [ ] Are embeddings the right dimension?

---

#### **Day 8 (Wednesday): Vector Search & Retrieval**

**Backend:**
- [ ] Create retrieval service
  ```python
  # backend/services/retriever.py
  class RetrieverService:
      async def search(
          self, 
          user_id: str, 
          query: str, 
          top_k: int = 5
      ) -> list[dict]:
          """
          Returns top-K most similar chunks with metadata
          """
          collection = get_or_create_collection(user_id)
          
          # Embed query
          query_embedding = await embedding_service.embed_text(query)
          
          # Search ChromaDB
          results = collection.query(
              query_embeddings=[query_embedding],
              n_results=top_k,
          )
          
          # Parse results
          chunks_with_metadata = []
          for i in range(len(results['documents'][0])):
              chunks_with_metadata.append({
                  'id': results['ids'][0][i],
                  'text': results['documents'][0][i],
                  'metadata': results['metadatas'][0][i],
                  'distance': results['distances'][0][i],
              })
          
          return chunks_with_metadata
  ```
- [ ] Create `/api/search` endpoint
  - Accepts query string
  - Returns top-5 chunks with IDs and metadata
  - Used by chat agent (backend only, not exposed to frontend directly)

**Testing:**
- [ ] Upload a PDF
- [ ] Search for a topic mentioned in the PDF
- [ ] Verify correct chunks returned

**Deliverable:** Query retrieval works. Chunks are ranked by relevance.

**Standup Checklist:**
- [ ] Can you search and get results?
- [ ] Are results ranked correctly?
- [ ] Does distance/similarity score make sense?

---

#### **Day 9 (Thursday): LLM Integration & Chat Endpoint**

**Backend:**
- [ ] Set up Ollama locally (if not already)
  ```bash
  ollama pull llama2
  ollama pull qwen
  ```
- [ ] Create LLM provider interface
  ```python
  # backend/ai/base.py
  class LLMProvider:
      async def complete(
          self, 
          prompt: str, 
          system: str = "",
          max_tokens: int = 2000,
          temperature: float = 0.7
      ) -> str:
          """Returns completion"""
      
      async def stream_complete(
          self, 
          prompt: str, 
          system: str = ""
      ) -> AsyncGenerator[str, None]:
          """Streams tokens one by one"""
  
  # backend/ai/ollama.py
  class OllamaProvider(LLMProvider):
      def __init__(self, base_url: str = "http://localhost:11434"):
          self.base_url = base_url
          self.client = httpx.AsyncClient()
      
      async def complete(self, prompt: str, system: str = "", **kwargs) -> str:
          response = await self.client.post(
              f"{self.base_url}/api/generate",
              json={
                  "model": "llama2",
                  "prompt": prompt,
                  "system": system,
                  "stream": False,
              }
          )
          data = response.json()
          return data["response"]
      
      async def stream_complete(self, prompt: str, system: str = ""):
          async with self.client.stream(
              "POST",
              f"{self.base_url}/api/generate",
              json={
                  "model": "llama2",
                  "prompt": prompt,
                  "system": system,
                  "stream": True,
              }
          ) as response:
              async for line in response.aiter_lines():
                  data = json.loads(line)
                  yield data["response"]
  ```
- [ ] Create Tutor Agent
  ```python
  # backend/agents/tutor_agent.py
  class TutorAgent:
      def __init__(self, llm: LLMProvider, retriever: RetrieverService):
          self.llm = llm
          self.retriever = retriever
      
      async def answer(self, user_id: str, question: str) -> dict:
          # Retrieve chunks
          chunks = await self.retriever.search(user_id, question, top_k=5)
          
          # Build prompt
          context = "\n".join([c['text'] for c in chunks])
          prompt = f"""You are a helpful tutor. Based on the following material from the student's notes, answer their question.

Material:
{context}

Student Question: {question}

Answer:"""
          
          # Get LLM response
          answer = await self.llm.complete(prompt)
          
          # Format citations
          citations = [
              {
                  "chunk_id": c['id'],
                  "text": c['text'][:100] + "...",  # Preview
                  "relevance": 1 - c['distance']  # Higher is more relevant
              }
              for c in chunks
          ]
          
          return {
              "answer": answer,
              "citations": citations,
          }
  ```
- [ ] Create `/api/chat` endpoint
  ```python
  @app.post("/api/chat")
  async def chat(request: ChatRequest):
      user_id = verify_clerk_token(request.token)
      
      # Get or create session
      session = await convex.upsert_session(user_id, request.session_id)
      
      # Call tutor agent
      result = await tutor_agent.answer(user_id, request.message)
      
      # Store message in Convex
      message_record = {
          "session_id": session["id"],
          "user_id": user_id,
          "role": "user",
          "content": request.message,
          "timestamp": time.time(),
      }
      await convex.add_message(message_record)
      
      # Store assistant response
      response_record = {
          "session_id": session["id"],
          "user_id": user_id,
          "role": "assistant",
          "content": result["answer"],
          "citations": result["citations"],
          "timestamp": time.time(),
      }
      await convex.add_message(response_record)
      
      return result
  ```
- [ ] Add `/api/chat/stream` WebSocket endpoint for streaming responses

**Convex:**
- [ ] Define `sessions` table schema
  ```javascript
  export const sessions = defineTable({
    userId: v.id("users"),
    mode: v.union(v.literal("text"), v.literal("voice")),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  }).index("by_user_id", ["userId"])
  ```
- [ ] Define `messages` table schema
  ```javascript
  export const messages = defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    citations: v.optional(v.array(v.object({
      chunkId: v.string(),
      text: v.string(),
      relevance: v.number(),
    }))),
    timestamp: v.number(),
  }).index("by_session_id", ["sessionId"])
  ```

**Frontend:**
- [ ] Build chat interface
  - Input field with send button
  - Display messages in thread
  - Show citations as expandable cards
  - Loading indicator while waiting for response
- [ ] Create ChatMessage component to display citations

**Testing:**
- [ ] Upload PDF with known content
- [ ] Ask question about that content
- [ ] Verify answer is grounded
- [ ] Verify citations point to correct chunks

**Deliverable:** End-to-end RAG pipeline works. Users can ask questions and receive grounded answers.

**Standup Checklist:**
- [ ] Can you ask a question and get an answer?
- [ ] Is the answer grounded in the uploaded material?
- [ ] Are citations showing?
- [ ] Does streaming work (tokens appear progressively)?

---

#### **Day 10 (Friday): Polish & Sprint Review**

**Frontend:**
- [ ] Fix UI bugs from testing
- [ ] Add error messages for failed uploads/queries
- [ ] Add loading states
- [ ] Improve chat message styling

**Backend:**
- [ ] Add error handling for Ollama downtime
- [ ] Add request logging
- [ ] Add rate limiting (10 req/min per user for now)
- [ ] Optimize embedding batch processing

**Testing:**
- [ ] Manual end-to-end testing: upload → ask → answer
- [ ] Test with multiple documents
- [ ] Test follow-up questions

**Demo (30 min):**
- Upload a PDF
- Ask a question
- See grounded answer with citations
- Navigate chat history

**Retrospective (30 min):**
- What was hardest? (LLM integration? ChromaDB setup?)
- What was easiest? (FastAPI? Shadcn UI?)
- Adjust Week 3 plan

**End-of-Week Checklist:**
- [ ] RAG pipeline is 99% working
- [ ] No data loss on document upload
- [ ] Chat history persists
- [ ] Answer latency <5s (acceptable for MVP)

---

## Week 3: Multi-Agent System & Quiz/Flashcard (Days 11–15)

**Dependency:** Week 2 complete (RAG pipeline working)

**Goal:** Implement Planner → Tutor/Quiz/Flashcard agents. Users can generate quizzes and flashcards from their material. Progress tracking begins.

**Success Criteria:**
- Generate 5–10 quiz questions from uploaded material
- Generate 20–30 flashcards from uploaded material
- Quiz scoring works correctly
- Progress is tracked per topic
- User can see mastery score on dashboard

### Week 3 Detailed Breakdown

#### **Day 11 (Monday): Planner & Quiz Agent**

**Backend:**
- [ ] Create Planner Agent (intent classification)
  ```python
  # backend/agents/planner_agent.py
  class PlannerAgent:
      async def classify_intent(self, message: str) -> dict:
          """
          Classify: "tutor", "quiz", "flashcard", "progress", "plan"
          """
          prompt = f"""Classify the user's intent into one of: 
          - tutor (asking a question)
          - quiz (wants to take a quiz)
          - flashcard (wants flashcards)
          - progress (asking about their progress)
          - plan (wants a study plan)
          
          User message: {message}
          
          Return JSON: {{"intent": "...", "topic": "..." (if applicable), "confidence": 0-1}}"""
          
          response = await self.llm.complete(prompt)
          return json.loads(response)
  ```
- [ ] Create Quiz Agent
  ```python
  # backend/agents/quiz_agent.py
  class QuizAgent:
      async def generate_quiz(
          self, 
          user_id: str, 
          topic: str, 
          num_questions: int = 8
      ) -> dict:
          """Generate quiz questions from retrieved chunks"""
          
          # Retrieve chunks for topic
          chunks = await self.retriever.search(user_id, topic, top_k=10)
          context = "\n".join([c['text'] for c in chunks])
          
          prompt = f"""Create {num_questions} multiple-choice quiz questions based on this material:

{context}

Format each question as JSON:
{{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct_answer": "A",
  "explanation": "...",
  "source_chunk_id": "chunk_id_here"
}}

Return a JSON array of {num_questions} questions."""
          
          response = await self.llm.complete(prompt)
          questions = json.loads(response)
          
          return {
              "topic": topic,
              "questions": questions,
              "source_chunks": chunks,
          }
  ```
- [ ] Create Quiz submission endpoint
  ```python
  @app.post("/api/quiz/submit")
  async def submit_quiz(request: QuizSubmitRequest):
      user_id = verify_clerk_token(request.token)
      
      # Score quiz
      quiz_data = await convex.get_quiz(request.quiz_id)
      score = 0
      total = len(quiz_data["questions"])
      
      for i, answer in enumerate(request.answers):
          if answer == quiz_data["questions"][i]["correct_answer"]:
              score += 1
      
      percentage = (score / total) * 100
      
      # Store result
      result = {
          "user_id": user_id,
          "quiz_id": request.quiz_id,
          "topic": quiz_data["topic"],
          "score": score,
          "total": total,
          "percentage": percentage,
          "timestamp": time.time(),
      }
      await convex.add_quiz_result(result)
      
      # Update progress
      await update_progress(user_id, quiz_data["topic"], percentage)
      
      return {
          "score": score,
          "total": total,
          "percentage": percentage,
          "passed": percentage >= 70,
      }
  ```

**Convex:**
- [ ] Define `quizzes` table schema
  ```javascript
  export const quizzes = defineTable({
    userId: v.id("users"),
    topic: v.string(),
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.string(),
      explanation: v.string(),
      sourceChunkId: v.string(),
    })),
    createdAt: v.number(),
  }).index("by_user_id", ["userId"])
  ```
- [ ] Define `quizResults` table schema
  ```javascript
  export const quizResults = defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    topic: v.string(),
    score: v.number(),
    total: v.number(),
    percentage: v.number(),
    completedAt: v.number(),
  }).index("by_user_id_topic", ["userId", "topic"])
  ```

**Frontend:**
- [ ] Build quiz generation interface (select topic, click "Generate Quiz")
- [ ] Build quiz taking interface (one question per screen)
- [ ] Build quiz results screen (score, review answers)

**Deliverable:** Users can generate and take quizzes. Scores are saved.

**Standup Checklist:**
- [ ] Can you generate a quiz from uploaded material?
- [ ] Does quiz reflect actual content?
- [ ] Are quiz scores saved correctly?

---

#### **Day 12 (Tuesday): Flashcard Agent**

**Backend:**
- [ ] Create Flashcard Agent
  ```python
  # backend/agents/flashcard_agent.py
  class FlashcardAgent:
      async def generate_flashcards(
          self, 
          user_id: str, 
          topic: str, 
          num_cards: int = 30
      ) -> dict:
          """Generate flashcard deck from retrieved chunks"""
          
          chunks = await self.retriever.search(user_id, topic, top_k=10)
          context = "\n".join([c['text'] for c in chunks])
          
          prompt = f"""Create {num_cards} educational flashcards from this material:

{context}

Each flashcard has a front (question/term) and back (answer/definition).
Make them concise and suitable for spaced repetition.

Format as JSON:
[
  {{
    "front": "What is photosynthesis?",
    "back": "Process by which plants convert sunlight into chemical energy...",
    "source_chunk_id": "chunk_id"
  }},
  ...
]

Return a JSON array of {num_cards} cards."""
          
          response = await self.llm.complete(prompt)
          cards = json.loads(response)
          
          return {
              "topic": topic,
              "cards": cards,
          }
  ```
- [ ] Create `/api/flashcards/generate` endpoint
- [ ] Create `/api/flashcards/{deckId}/review` endpoint for card review

**Convex:**
- [ ] Define `flashcardDecks` table schema
  ```javascript
  export const flashcardDecks = defineTable({
    userId: v.id("users"),
    topic: v.string(),
    cards: v.array(v.object({
      front: v.string(),
      back: v.string(),
      sourceChunkId: v.string(),
      nextReviewAt: v.number(),  // Unix timestamp for SR scheduling
      difficulty: v.number(),     // 0-1 (1 = hardest)
      repetitions: v.number(),    // SM-2 algorithm
      interval: v.number(),       // Days until next review
      easeFactor: v.number(),     // SM-2 algorithm
    })),
    createdAt: v.number(),
  }).index("by_user_id_topic", ["userId", "topic"])
  ```
- [ ] Define `cardReviews` table schema to track review history

**Frontend:**
- [ ] Build flashcard review interface (flip animation, answer buttons)
- [ ] Implement SM-2 spaced repetition scheduling
- [ ] Show "due cards" first
- [ ] Build deck management (view deck, delete, re-generate)

**Testing:**
- [ ] Generate flashcards
- [ ] Review them, verify SR scheduling

**Deliverable:** Flashcard generation and review working. SM-2 scheduling tracks card difficulty.

**Standup Checklist:**
- [ ] Can you generate flashcards?
- [ ] Do cards accurately reflect the material?
- [ ] Does SM-2 scheduling work?

---

#### **Day 13 (Wednesday): Progress Tracking & Mastery Scoring**

**Backend:**
- [ ] Create Progress Agent
  ```python
  # backend/agents/progress_agent.py
  class ProgressAgent:
      async def update_mastery(
          self, 
          user_id: str, 
          topic: str, 
          score: float
      ):
          """Update mastery score for a topic"""
          
          # Get existing progress for this topic
          existing = await convex.get_progress(user_id, topic)
          
          if existing:
              # Rolling average of last 3–5 attempts
              recent_scores = existing["scores"][-4:]  # Keep last 4
              recent_scores.append(score)
              mastery_score = sum(recent_scores) / len(recent_scores)
          else:
              mastery_score = score
          
          # Store updated progress
          progress = {
              "user_id": user_id,
              "topic": topic,
              "masteryScore": mastery_score,
              "scores": recent_scores if existing else [score],
              "attempts": (existing["attempts"] if existing else 0) + 1,
              "lastReviewedAt": time.time(),
          }
          
          await convex.upsert_progress(progress)
  
      async def get_study_plan(self, user_id: str) -> list[dict]:
          """Generate personalized study plan"""
          
          # Get all progress for this user
          all_progress = await convex.get_user_progress(user_id)
          
          # Sort by mastery score (weakest first)
          sorted_topics = sorted(
              all_progress, 
              key=lambda x: x["masteryScore"]
          )
          
          # Recommend reviewing bottom 30%
          recommendations = [
              {
                  "topic": p["topic"],
                  "masteryScore": p["masteryScore"],
                  "recommendation": "Review this topic" if p["masteryScore"] < 0.7 else "Quiz yourself",
                  "priority": 1 if p["masteryScore"] < 0.5 else 2 if p["masteryScore"] < 0.7 else 3,
              }
              for p in sorted_topics
          ]
          
          return recommendations
  ```
- [ ] Create `/api/progress` endpoint (get user's progress data)
- [ ] Create `/api/study-plan` endpoint (get personalized recommendations)

**Convex:**
- [ ] Define `progress` table schema
  ```javascript
  export const progress = defineTable({
    userId: v.id("users"),
    topic: v.string(),
    masteryScore: v.number(),      // 0-100
    scores: v.array(v.number()),   // Recent scores for trending
    attempts: v.number(),
    lastReviewedAt: v.number(),
  }).index("by_user_id_topic", ["userId", "topic"])
  ```

**Testing:**
- [ ] Take a quiz, verify mastery score updates
- [ ] Take another quiz on same topic, verify rolling average
- [ ] Check that study plan recommends weakest topics

**Deliverable:** Mastery tracking working. Study plan generated.

**Standup Checklist:**
- [ ] Does mastery score update after quiz?
- [ ] Is rolling average calculated correctly?
- [ ] Does study plan show weakest topics first?

---

#### **Day 14 (Thursday): Dashboard Analytics**

**Frontend:**
- [ ] Build mastery grid (heat map of topics)
  ```jsx
  // Grid shows rows = topics, color intensity = mastery %
  // Green (80+%) | Yellow (60-79%) | Red (<60%)
  ```
- [ ] Build session timeline (list of past quizzes/flashcards/chats)
- [ ] Build accuracy trend chart (score over time per topic)
- [ ] Build time-on-topic histogram
- [ ] Build study plan card (recommendations)

**Testing:**
- [ ] Take multiple quizzes on different topics
- [ ] Verify dashboard updates correctly
- [ ] Verify charts display data

**Deliverable:** Dashboard shows comprehensive analytics. Students understand their progress at a glance.

**Standup Checklist:**
- [ ] Can you see your mastery grid?
- [ ] Do charts update after quiz?
- [ ] Does study plan update?

---

#### **Day 15 (Friday): Sprint Review & Polish**

**Testing:**
- [ ] End-to-end flow: upload → chat → quiz → flashcards → dashboard
- [ ] Fix UI bugs
- [ ] Optimize performance (vector search <500ms)

**Demo (30 min):**
- Upload multiple documents
- Ask questions
- Generate quiz and flashcards
- Show dashboard with progress

**Retrospective (30 min):**
- What's working well? (Agents architecture? Convex real-time?)
- What needs improvement? (LLM response quality? Chunk relevance?)

**End-of-Week Checklist:**
- [ ] All agents wired together
- [ ] Quiz generation quality >80%
- [ ] Flashcard generation quality >80%
- [ ] Progress tracking accurate
- [ ] Dashboard displays correctly

---

## Week 4: Voice AI & Polish (Days 16–20)

**Dependency:** Week 3 complete (multi-agent system working)

**Goal:** Add voice input (Whisper STT) and voice output (ElevenLabs TTS). Polish all features for beta launch.

**Success Criteria:**
- Users can ask questions by voice
- System can respond via voice (natural sounding)
- Voice mode works end-to-end (not as polished as text, but functional)
- All critical bugs fixed
- API docs generated
- Deployment configured

### Week 4 Detailed Breakdown

#### **Day 16 (Monday): Speech-to-Text (Whisper)**

**Backend:**
- [ ] Set up Whisper locally OR Whisper API
  ```python
  # backend/services/stt.py
  class STTProvider:
      async def transcribe(self, audio_bytes: bytes) -> str:
          """Returns transcribed text"""
  
  class WhisperLocalProvider(STTProvider):
      def __init__(self):
          import whisper
          self.model = whisper.load_model("base")  # 140MB
      
      async def transcribe(self, audio_bytes: bytes) -> str:
          # Save to temp file
          with open("/tmp/audio.wav", "wb") as f:
              f.write(audio_bytes)
          
          # Transcribe
          result = self.model.transcribe("/tmp/audio.wav")
          return result["text"]
  
  class WhisperAPIProvider(STTProvider):
      async def transcribe(self, audio_bytes: bytes) -> str:
          # Use OpenAI API
          async with openai.AsyncOpenAI() as client:
              transcript = await client.audio.transcriptions.create(
                  model="whisper-1",
                  file=("audio.wav", audio_bytes)
              )
              return transcript.text
  ```
- [ ] Create `/api/voice/transcribe` endpoint
- [ ] Add WebSocket endpoint for live streaming transcription (optional, for advanced use)

**Frontend:**
- [ ] Add "push-to-talk" button to chat interface
- [ ] Use browser `MediaRecorder` API to capture audio
- [ ] Show recording indicator (waveform or timer)
- [ ] Send audio to backend
- [ ] Display transcribed text before sending

**Testing:**
- [ ] Record audio, verify transcription is accurate

**Deliverable:** Voice input working. Users can speak questions.

**Standup Checklist:**
- [ ] Can you record audio and get transcription?
- [ ] Is transcription accurate?

---

#### **Day 17 (Tuesday): Text-to-Speech (ElevenLabs)**

**Backend:**
- [ ] Set up ElevenLabs integration
  ```python
  # backend/services/tts.py
  class TTSProvider:
      async def synthesize(self, text: str, voice_id: str = "default") -> bytes:
          """Returns audio bytes"""
  
  class ElevenLabsTTSProvider(TTSProvider):
      def __init__(self, api_key: str):
          self.api_key = api_key
          self.base_url = "https://api.elevenlabs.io/v1"
          self.voice_id = "21m00Tcm4TlvDq8ikWAM"  # Example Rachel voice
      
      async def synthesize(self, text: str, voice_id: str = None) -> bytes:
          url = f"{self.base_url}/text-to-speech/{voice_id or self.voice_id}"
          
          async with httpx.AsyncClient() as client:
              response = await client.post(
                  url,
                  json={"text": text},
                  headers={"xi-api-key": self.api_key},
              )
              return response.content  # MP3 bytes
  ```
- [ ] Create `/api/voice/synthesize` endpoint
  - Accepts text
  - Returns audio URL or streams audio

**Frontend:**
- [ ] Add audio player component to chat messages
- [ ] Display speaker icon for voice replies
- [ ] Auto-play or manual play button
- [ ] Volume control

**Testing:**
- [ ] Generate audio from text
- [ ] Verify audio quality

**Deliverable:** Voice output working. Users can hear tutor responses.

**Standup Checklist:**
- [ ] Can you synthesize text to speech?
- [ ] Does audio sound natural?

---

#### **Day 18 (Wednesday): Voice Chat Workflow**

**Backend:**
- [ ] Update `/api/chat` to accept voice input
  ```python
  @app.post("/api/chat/voice")
  async def voice_chat(file: UploadFile):
      user_id = verify_clerk_token(request.token)
      
      # Transcribe
      audio_bytes = await file.read()
      transcript = await stt_provider.transcribe(audio_bytes)
      
      # Call tutor agent (same as text chat)
      result = await tutor_agent.answer(user_id, transcript)
      
      # Synthesize response
      audio = await tts_provider.synthesize(result["answer"])
      
      # Store in session
      # ...
      
      return {
          "transcript": transcript,
          "answer": result["answer"],
          "audio_url": "...",
          "citations": result["citations"],
      }
  ```

**Frontend:**
- [ ] Build voice chat mode toggle
- [ ] Voice mode: record → transcribe → answer → play audio
- [ ] Show transcript + answer text

**Testing:**
- [ ] Record question → get transcribed text → get voice answer

**Deliverable:** End-to-end voice chat working.

**Standup Checklist:**
- [ ] Can you ask by voice and get answer by voice?
- [ ] Is latency acceptable (<5s total)?

---

#### **Day 19 (Thursday): Bug Fixes & Performance Optimization**

**Testing & Fixes:**
- [ ] Test all features (upload, chat, quiz, flashcards, voice) in combination
- [ ] Fix any blocking bugs
- [ ] Optimize vector search latency
- [ ] Optimize LLM response latency
- [ ] Fix memory leaks (check ChromaDB, Ollama memory usage)
- [ ] Test with 100+ documents

**Performance Targets:**
- [ ] Chat response <4s (p95)
- [ ] Vector search <500ms
- [ ] Flashcard review instant (<100ms)
- [ ] Page load <2s

**Documentation:**
- [ ] Write API docs (Swagger UI auto-generated from FastAPI)
- [ ] Write user guide (how to upload, ask questions, generate quizzes, etc.)
- [ ] Write architecture documentation
- [ ] Write deployment guide

**Deliverable:** System is stable and performant. Documentation complete.

**Standup Checklist:**
- [ ] Are there any console errors?
- [ ] Is latency acceptable?
- [ ] Are all features working together?

---

#### **Day 20 (Friday): Final Demo & Week 4 Sprint Review**

**Final Demo (45 min to stakeholders):**
1. Sign up
2. Upload PDF
3. Ask question → get grounded answer
4. Ask by voice → hear response
5. Generate quiz → take it
6. Generate flashcards → review
7. Check dashboard → see progress

**Retrospective (30 min):**
- What's production-ready?
- What needs more work?
- What learnings for deployment?

**Launch Prep:**
- [ ] Deployment checklist started
- [ ] Monitoring/logging configured
- [ ] Error tracking set up (Sentry)
- [ ] Rate limiting configured
- [ ] HTTPS configured
- [ ] Database backups enabled

---

## Week 5: Deployment & Launch (Days 21–25)

**Dependency:** Week 4 complete (all features working, documented, tested)

**Goal:** Deploy to production, conduct beta testing, launch publicly.

**Success Criteria:**
- Production database and API running
- Frontend deployed on Vercel
- 50+ beta testers
- Zero critical bugs in production
- <4s API response latency in production
- 99% uptime

### Week 5 Detailed Breakdown

#### **Day 21 (Monday): Deployment Pipeline & Infrastructure**

**DevOps:**
- [ ] Set up GitHub Actions CI/CD pipeline
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy
  on: [push]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: |
            cd backend && pip install -r requirements.txt
            pytest tests/
        - run: |
            cd apps/web && pnpm install && pnpm build
  
    deploy:
      needs: test
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/main'
      steps:
        - uses: actions/checkout@v3
        - name: Deploy backend to Railway
          run: |
            # Configure Railway CLI
            railway deploy --service backend
        - name: Deploy frontend to Vercel
          run: |
            # Configure Vercel CLI
            vercel deploy --prod
  ```
- [ ] Configure Railway/Render for backend hosting
- [ ] Configure Vercel for frontend hosting
- [ ] Set up environment secrets (Clerk, API keys, etc.)
- [ ] Configure PostgreSQL backups (Convex handles this)
- [ ] Set up monitoring (Sentry for errors, DataDog for metrics)

**Testing:**
- [ ] Deploy to staging environment first
- [ ] Run smoke tests against staging
- [ ] Load test with 100 concurrent users
- [ ] Test with 50+ real beta testers

**Deliverable:** CI/CD pipeline working. Staging environment matches production.

**Standup Checklist:**
- [ ] Can you deploy to staging automatically?
- [ ] Do smoke tests pass?
- [ ] Is staging stable?

---

#### **Day 22 (Tuesday): Beta Testing & Bug Fixes**

**Beta Testing:**
- [ ] Recruit 50+ beta testers (students, teachers, self-learners)
- [ ] Distribute beta signup link
- [ ] Collect feedback via in-app survey
- [ ] Monitor error logs in Sentry
- [ ] Track key metrics: signup, upload, quiz generation, etc.

**Common Issues to Fix:**
- PDFs not parsing correctly (specific formats)
- Quizzes with poor quality
- LLM timeouts
- Voice transcription accuracy

**Deliverable:** 50+ users testing the system. Feedback collected.

**Standup Checklist:**
- [ ] Are beta testers able to sign up?
- [ ] Are critical bugs being fixed in real-time?
- [ ] Is feedback being logged?

---

#### **Day 23 (Wednesday): Production Deployment**

**Final Pre-Launch Checks:**
- [ ] All Sentry errors reviewed and categorized
- [ ] Performance metrics reviewed (latency, error rates)
- [ ] Security scan completed (no exposed API keys)
- [ ] Database backups verified
- [ ] Load test results reviewed (target: 1,000 concurrent users)
- [ ] Monitoring & alerting configured

**Deploy to Production:**
- [ ] Merge main branch to production branch
- [ ] GitHub Actions triggers deployment
- [ ] Backend deployed to Railway/Render
- [ ] Frontend deployed to Vercel
- [ ] Verify production endpoints responding
- [ ] Smoke test production environment

**On-Call Rotation:**
- [ ] Establish on-call schedule for first week
- [ ] Runbooks for common issues
- [ ] Escalation procedure if issues arise

**Deliverable:** System is live in production. No critical errors.

**Standup Checklist:**
- [ ] Is production API responding?
- [ ] Are users able to sign up?
- [ ] Are error rates low?

---

#### **Day 24 (Thursday): Post-Launch Monitoring**

**Day-1 Monitoring:**
- [ ] Check API response times (target: <4s)
- [ ] Check error rates (target: <0.1%)
- [ ] Monitor database query times
- [ ] Monitor vector search latency
- [ ] Check cloud costs

**Metrics to Track:**
- API response time distribution (p50, p95, p99)
- Error rate by endpoint
- User signup rate
- Document upload rate
- Successful quiz generations
- System uptime

**If Issues Arise:**
- [ ] Rollback procedure (redeploy previous commit)
- [ ] Hotfix procedure (merge to main, auto-deploy)
- [ ] Incident communication (status page)

**Deliverable:** Production system stable. Metrics baseline established.

**Standup Checklist:**
- [ ] Is the system stable?
- [ ] Are response times acceptable?
- [ ] Are users happy?

---

#### **Day 25 (Friday): Post-Launch Retrospective & Planning**

**Post-Launch Retrospective (1 hour):**
- What went well in the launch?
- What could have been better?
- What surprised us?
- What's the top priority for Week 6?

**Week 1 Post-Launch Focus:**
- [ ] Fix any critical bugs
- [ ] Optimize based on real usage data
- [ ] Respond to user feedback
- [ ] Plan Phase 2 (mobile app, advanced features)

**Success Criteria Met?**
- ✅ MVP shipped to production
- ✅ Auth working (Clerk)
- ✅ Document upload & parsing working
- ✅ RAG chat working (<4s latency)
- ✅ Quiz generation working
- ✅ Flashcard generation working
- ✅ Progress tracking working
- ✅ Voice I/O working (basic)
- ✅ Dashboard analytics working
- ✅ 50+ beta users testing
- ✅ 99% uptime achieved
- ✅ <100ms API cold start
- ✅ Zero critical security issues

---

## Dependencies & Risk Mitigation

### Critical Dependencies

| Dependency | Risk | Mitigation |
|------------|------|-----------|
| Ollama availability | LLM goes down during dev | Use OpenAI API as fallback |
| Clerk integration | Auth fails | Firebase Auth as backup |
| ChromaDB performance | Vector search slows | Qdrant/Pinecone ready as backup |
| Convex reliability | Database goes down | Automated backups, monitoring |

### Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Quiz quality poor | High | Users leave | Prompt iteration, teacher review |
| Voice latency high | Medium | Bad UX | Async processing, fallback to text |
| Vector search slow with 1M+ vectors | Low | Can't scale | Optimize chunk size, add reranking |
| Cost overruns (LLM API) | Medium | Budget | Use Ollama locally, rate limit |

---

## Success Criteria (Week-by-Week)

| Week | Milestone | Success Metric |
|------|-----------|----------------|
| 1 | Auth + Upload UI | Users can sign up and upload files |
| 2 | RAG Pipeline | Chat response <4s with citations |
| 3 | Multi-Agent + Quiz/Flashcard | Quiz quality >80%, Flashcard coverage >90% |
| 4 | Voice + Polish | Voice latency <5s, all features stable |
| 5 | Launch | 50+ beta users, 99% uptime, <4s latency |

---

## Notes for Engineering Team

### Code Quality Standards

- **Linting:** ESLint (frontend), Pylint (backend)
- **Testing:** Pytest (backend), Vitest (frontend)
- **Formatting:** Prettier (code), Black (Python)
- **Type Checking:** Pydantic (Python runtime validation)

### Git Workflow

- Branches: `main` (production), `develop` (integration), `feature/*` (features)
- PRs required before merge
- CI must pass (tests, lint)
- Code review by at least one other engineer

### Standup Format (15 min, daily)

1. What did you accomplish yesterday?
2. What are you working on today?
3. Any blockers or help needed?

### Demo Days

Every Friday: 30-min demo + 30-min retrospective to stakeholders and team.

---

**Document Status:** Ready for Engineering Kickoff  
**Approval:** Tech Lead, Project Manager  
**Distribution:** Engineering Team, Product, Leadership
