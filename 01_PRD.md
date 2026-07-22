# SuperMentor AI – Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** July 2026  
**Status:** Production Development  
**Audience:** Product, Engineering, Design Teams

---

## 1. Executive Summary

**SuperMentor AI** is a production-ready, AI-powered personalized learning platform that transforms a student's own study material into an interactive tutoring experience.

Instead of asking generic AI chatbots (which hallucinate), SuperMentor AI grounds every answer in the student's uploaded documents via Retrieval-Augmented Generation (RAG). Students upload PDFs, slide decks, lecture notes, and transcripts once. The platform then handles the tutoring, quiz generation, flashcard creation, progress tracking, and study planning—all from their own source material.

**Core Value Proposition:**  
> A student goes from scattered study material to a personalized tutor that knows exactly what was taught — in one guided conversation.

---

## 2. Target Users & Market

### Primary Users (MVP)

| User Type | Need | Addressable Market |
|-----------|------|-------------------|
| **College Students** | Personalized exam prep without hallucination | ~8M in India, ~50M globally |
| **Competitive Exam Students** | Grounded Q&A on JEE, NEET, UPSC material | ~3M annually in India |
| **Self-Learners** | Structure and tracking for independent study | Growing segment, ~10M+ globally |
| **Teachers** | Automated quiz/flashcard generation from curriculum | ~4M in India |
| **Coaching Institutes** | AI-augmented tutor for large cohorts | Tier-2/3 cities, high growth |

### Secondary Users (Phase 2+)

- Tutoring centers and one-on-one tutors
- Corporate L&D teams for upskilling
- Universities for supplemental instruction

---

## 3. Problem Statement

### The Gap

Students accumulate study material in fragmented formats (PDFs, slide decks, handwritten notes, recordings) with no single tool that:

1. **Understands all formats together** — a tool that treats a PDF and a lecture recording as parts of one searchable knowledge base
2. **Grounds answers in real material** — generic AI assistants answer from the open internet, not from the student's specific textbook edition or professor's notes
3. **Generates on-demand revision material** — quizzes and flashcards must be auto-created from the actual course content, not generic question banks
4. **Tracks mastery persistently** — which topics does a student actually understand vs. merely skim-read?
5. **Works hands-free** — voice-based revision while commuting, exercising, or doing chores

### Consequences

- Study time wasted re-reading instead of actively testing knowledge
- Generic AI answers can be confidently wrong
- Manual flashcard creation doesn't scale to a full course
- No way to know what's actually been learned
- Voice-capable study tools are rare

---

## 4. Solution Overview

SuperMentor AI provides a unified workspace where students can:

1. **Upload** their own material (PDF, PPTX, DOCX, transcripts, audio)
2. **Ask** questions by text or voice and receive grounded, cited answers
3. **Generate** quizzes and flashcards directly from the uploaded content
4. **Track** mastery by topic and see progress over time
5. **Receive** a personalized study plan based on weak areas
6. **Study** hands-free via voice mode while commuting or doing other activities

**Key Insight:** Every answer is retrieved from the student's own material first, generated second. This keeps the system accurate and hallucination-resistant.

---

## 5. Core Features (MVP)

### 5.1 Authentication & Onboarding

- **Sign-up/Login** via Clerk (email, Google OAuth, GitHub OAuth)
- **Profile Management** — upload profile picture, set learning goals, configure study preferences
- **First-Time Setup** — quick onboarding to teach users how to upload and ask questions

**Success Metric:** <5 min onboarding to first upload

---

### 5.2 Upload & Knowledge Base

**Upload Center:**
- Drag-and-drop interface supporting PDF, PPTX, DOCX, TXT, and transcript files
- File size limits enforced (max 50MB per file, max 1GB per user initially)
- Real-time parsing status indicator (uploading → parsing → embedding → ready)
- Ability to upload multiple files at once (batch upload)
- Preview of parsed content before confirmation

**Knowledge Base View:**
- Organized by upload date or custom folders
- Search documents by name or content keywords
- Delete/re-upload documents
- View parsing/embedding status
- See usage statistics (e.g., "3.2K chunks, 4.1MB vectors")

**Success Metric:** Student uploads 5+ documents and uses them in 3+ chat sessions within first week

---

### 5.3 Chat Interface (Tutor)

**Text Mode:**
- Clean chat UI with message history
- Type a question → get a grounded, cited answer within 3–5 seconds
- Answers include source citations (which chunk, which document)
- Follow-up questions stay within the same retrieved context
- Ability to bookmark/save conversations

**Voice Mode:**
- Click to speak (push-to-talk or always-on)
- Whisper transcribes the spoken question
- Answer synthesized to speech via ElevenLabs
- Text transcript shown simultaneously for accessibility
- Mode toggle mid-conversation

**Context-Awareness:**
- Student can select which documents to search (or search all)
- Can specify a topic or chapter to narrow retrieval
- Session history retained per study session

**Success Metric:** Average answer latency <4s, citation accuracy >95%

---

### 5.4 Quiz Generation & Taking

**Quiz Creation:**
- "Quiz me on [topic]" triggers the Quiz Agent
- Quiz Agent generates 5–10 multiple-choice or short-answer questions from retrieved chunks
- Questions include correct answer + explanation grounded in source material
- Difficulty can be adjusted (easy/medium/hard based on progress history)

**Quiz Review:**
- Clean quiz interface with one question per screen
- Support for multiple-choice, short-answer, and true/false
- Immediate feedback after submission with explanation
- Score saved to progress record

**Success Metric:** Generated quizzes reflect actual course content, not generic trivia (validation via teacher spot-check)

---

### 5.5 Flashcard Generation & Review

**Flashcard Creation:**
- "Make flashcards for [topic]" triggers the Flashcard Agent
- Agent generates front/back cards from retrieved chunks (30–50 cards typical)
- Cards are concise (front: term, back: definition + context)
- Option to add custom cards or edit generated ones

**Spaced Repetition:**
- Cards scheduled for review based on SM-2 algorithm
- Show due cards first, older cards pushed back if answered correctly
- Track accuracy per card
- Visual progress indicator

**Success Metric:** Students review 3+ flashcard sessions per week, retention rate >75%

---

### 5.6 Progress Tracking & Analytics

**Progress Dashboard:**
- **Mastery Grid:** Heat map of topics, color-coded by mastery (0–100%)
- **Session Timeline:** Chronological view of quiz attempts, flashcard reviews, and chat sessions
- **Accuracy Trend:** Quiz score progression over time per topic
- **Time on Topic:** Histogram of study time invested per subject
- **Study Plan Card:** Current weakest topics ranked for priority study

**Metrics Tracked:**
- Per-topic quiz accuracy over time
- Flashcard retention rate per card
- Total time invested per document/topic
- Chat session frequency and question type
- Mastery score by topic (rolling average of recent quiz attempts)

**Success Metric:** Students check dashboard 2+ times per week, report actionable insights

---

### 5.7 Study Planner

**Auto-Generated Plan:**
- Progress Agent synthesizes mastery data into a ranked study plan
- Weak topics appear first
- Plan updates after each quiz/flashcard session
- Recommendations include suggested next action (e.g., "Review Chapter 3, Topic: Thermodynamics")

**Manual Planning:**
- Students can create custom study goals
- Set target dates for exams or milestones
- Get reminders for upcoming sessions

**Success Metric:** Students follow the recommended plan for 50%+ of sessions

---

### 5.8 Voice AI

**Speech-to-Text (Input):**
- Whisper (open-source, runs locally during dev; API version for production)
- Support for English, Hindi, and Spanish in MVP
- Latency <2s for transcription

**Text-to-Speech (Output):**
- ElevenLabs API in production (natural, engaging voices)
- Fallback to browser TTS during development
- Support for multiple voices/accents
- Audio playback in-app or download

**Voice-Specific UX:**
- Always-on transcription with visual waveform
- Ability to edit transcribed text before sending
- Play/pause audio controls
- Speed adjustment for playback

**Success Metric:** 30%+ of study sessions include voice interaction

---

## 6. User Journeys

### Journey 1: First-Time Student (College Exam Prep)

1. Sign up via email or Google
2. Upload 3 lecture PDFs and 1 slide deck
3. Ask "What are the types of chemical bonds?" in chat
4. Receive grounded answer with citation to Chapter 2 of Organic Chemistry PDF
5. Ask "Quiz me on this topic" → take 8-question quiz
6. Check dashboard → see 65% accuracy on chemical bonds, plan recommends more review
7. Create flashcards → review 15 cards, 10 correct
8. Progress updates to 72% mastery
9. Next session: app reminds user to review weak topics

**Duration:** 15 min from signup to first quiz

---

### Journey 2: Self-Learner (Independent Study)

1. Upload personal handwritten notes (OCR processed), a YouTube transcript, and a textbook PDF
2. Start voice study session while commuting
3. Speak: "Explain quantum tunneling"
4. Hear grounded answer via ElevenLabs
5. Speak: "Quiz me on quantum mechanics"
6. Take voice quiz (questions read aloud, answer via voice)
7. Check mastery grid later → see progress on quantum topics
8. Receive study plan suggesting weak areas

**Duration:** 30 min study session, no reading required

---

### Journey 3: Teacher/Tutor (Class Prep)

1. Upload course syllabus PDF and lecture slides
2. Use admin dashboard to configure quiz difficulty and topics
3. Generate quiz from Chapter 5 → customize and assign to class
4. Monitor student progress across the cohort
5. Identify students struggling with specific topics
6. Create targeted review materials

**Duration:** Ongoing, reusable across cohorts

---

## 7. Business Goals

### Year 1 Goals

| Goal | Target | Success Metric |
|------|--------|----------------|
| **User Adoption** | 10,000 active students | Weekly active users (WAU) |
| **Engagement** | 4+ study sessions/week average | Session frequency, time on app |
| **Retention** | 40%+ 30-day retention | Cohort retention curves |
| **Platform Stability** | 99.5% uptime | Incident tracking, monitoring |
| **Cost per Acquisition** | <$5 per user | Marketing spend / signups |

### Revenue Goals (Post-MVP)

- **Freemium Model:** 5 documents, 20 chats/month free
- **Pro Plan:** $9.99/month (unlimited docs, unlimited chats, priority support)
- **Family Plan:** $19.99/month (5 accounts)
- **Target:** 5% conversion rate = 500 paid users by month 6

---

## 8. Success Metrics (OKRs)

### Objective 1: Build a Trustworthy AI Tutor

**Key Results:**
- Citation accuracy >98% (answers properly grounded in source chunks)
- Hallucination rate <2% (validated by teacher spot-checks)
- User trust score >4/5 (in-app survey after answer)

---

### Objective 2: Drive Daily Active Engagement

**Key Results:**
- 40%+ of users return within 7 days
- 25%+ of users study 4+ days per week
- Average session duration >10 minutes
- Quiz completion rate >50% (students who generate quizzes take them)

---

### Objective 3: Demonstrate Learning Outcomes

**Key Results:**
- 70%+ of quiz takers show mastery improvement over 3 sessions
- Students report 2–3 hours saved on manual flashcard creation
- Teacher cohorts show 15%+ improvement in exam scores vs. control

---

### Objective 4: Scalable & Reliable Infrastructure

**Key Results:**
- 99.5% API uptime
- Chat response latency <4s (p95)
- Support 10,000 concurrent users without degradation
- Zero data loss incidents

---

## 9. Non-Functional Requirements

### Performance

- Chat response latency: <4s (p95)
- Document upload & parsing: <2min for 10MB file
- Voice transcription: <3s
- Vector search: <500ms
- Page load time: <2s (web)

### Scalability

- Support 100+ concurrent users (MVP)
- Support 1M+ vectors per user (ChromaDB)
- Support 100K users on shared infrastructure
- Microservice-ready architecture (no monolith)

### Security

- End-to-end encryption for file uploads (at-rest)
- OAuth 2.0 for authentication
- RBAC (Role-Based Access Control) for multi-user scenarios
- GDPR-compliant data deletion
- No API keys exposed to frontend
- HTTPS everywhere

### Reliability

- Automated backups (PostgreSQL + file storage)
- Graceful degradation if vector DB is down
- Retry logic for LLM API failures
- Session persistence across network interruptions

### Accessibility

- WCAG 2.1 AA compliance
- Voice input/output as primary accessibility feature
- Keyboard navigation throughout
- Screen reader support
- High contrast mode

---

## 10. Constraints & Assumptions

### Technical Constraints

- Local development uses Ollama (no OpenAI API keys required)
- Vector DB starts with ChromaDB, architecture allows future migration to Pinecone/Qdrant
- File size limit: 50MB per file, 1GB per user (MVP)
- Voice support initially English/Hindi/Spanish only
- Maximum 10 concurrent LLM calls per user (prevent overload)

### Regulatory Constraints

- GDPR compliance for EU users
- COPPA considerations (younger students)
- Educational data privacy (FERPA-equivalent for India)
- No PII stored in vector embeddings

### Budget Constraints

- MVP must be launchable on <$500/month infrastructure
- No payment processing setup during MVP (freemium metrics only)
- Development uses open-source tools where possible

### Timeline Constraints

- MVP launch target: 5 weeks
- Phase 2 (mobile): Month 3-4
- Phase 3 (advanced analytics): Month 5-6

---

## 11. Out of Scope (Phase 2+)

- Mobile applications (Phase 2)
- Desktop app (Phase 3)
- Multi-language support beyond English/Hindi/Spanish
- Real-time collaborative study rooms
- Integration with LMS platforms (Moodle, Canvas, Blackboard)
- Video tutoring (live instructor integration)
- Gamification (leaderboards, badges)
- Advanced adaptive difficulty engines

---

## 12. Success Criteria for MVP

### Launch Criteria

✅ User can upload PDF, PPTX, DOCX, and transcript files  
✅ Chat returns grounded answers with source citations within 4s  
✅ Quiz generation works and reflects actual document content  
✅ Flashcard generation produces usable cards  
✅ Progress tracking and mastery scoring are persistent  
✅ Voice input (Whisper) and output (ElevenLabs) work end-to-end  
✅ Authentication via Clerk works  
✅ Dashboard displays analytics correctly  
✅ 99%+ uptime in staging environment  
✅ <100ms cold start for API endpoints  

### Go-Live Criteria

- 50+ beta testers used for 2+ weeks
- Citation accuracy validated >95% by teacher review
- No critical bugs in user flows
- Onboarding time <5 minutes
- API documentation complete
- Deployment runbook documented

---

## 13. Post-Launch Roadmap

### Month 1–2: Stabilization & Retention

- Fix bugs from beta feedback
- Optimize chat latency to <3s
- Improve quiz quality based on teacher feedback
- Add custom folder organization
- Implement user feedback modal

### Month 3–4: Mobile Launch

- React Native app parity with web
- Offline flashcard mode
- Native push notifications

### Month 5–6: Advanced Learning

- Adaptive difficulty engine
- Spaced-repetition tuning
- Cohort management for teachers
- Learning analytics for institutions

---

## 14. Appendix: Definitions

**RAG (Retrieval-Augmented Generation):** Architecture where answers are grounded by first retrieving relevant document chunks, then generating responses based on those chunks rather than LLM training data alone.

**Mastery Score:** Rolling average of quiz accuracy on a topic over the past 3–5 attempts, on a 0–100 scale.

**Citation:** Reference to the specific chunk (with document name and page/section) that supports an answer.

**Hallucination:** When an LLM confidently states something factually incorrect or unsupported by the provided context.

**Spaced Repetition:** Learning technique where flashcards are reviewed at increasing intervals based on recall performance (SM-2 algorithm).

---

**Document Status:** Ready for Engineering & Design handoff  
**Approval:** Product Lead  
**Distribution:** Engineering, Design, Marketing, Leadership
