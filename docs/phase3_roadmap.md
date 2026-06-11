# SkillVerse: Phase 3 - Development Roadmap & Features List

To launch **SkillVerse** successfully as a venture-backed startup, we divide product development into three phases: MVP (validate customer demand & basic matching), V1 (integrate proprietary AI vernacular engine, micro-learning, and scale pipeline), and Future (enterprise features & algorithmic optimization).

---

## 1. Feature Phase Matrix

| Feature Module | MVP (Weeks 1-4) | V1 Launch (Months 2-5) | Future Scale (Month 6+) |
| :--- | :--- | :--- | :--- |
| **Auth & Profiles** | Mobile OTP (SMS), Worker & Employer Role Profile setup, Hindi/English. | WhatsApp OTP fallback, Auto-translation of inputs, 6 Regional languages. | OAuth for enterprise clients, multi-admin permissions. |
| **Skill Passport** | Visual Web Passport URL, list self-declared experience & basic profile tags. | Auto-generated Visual PDF + QR code, AI-verified badges, user reviews. | Blockchain-backed certificate verification, direct job history auto-updates. |
| **AI Assessment** | Mock/Static voice recording page, simple text-based skill self-checks. | Asynchronous Voice Assessment Queue, Whisper STT integration, AI Scoring. | Video-based practical skill assessments (e.g. check tool handling), fraud detection. |
| **Marketplace** | Geospatial job postings, visual job card feed, "One-click Apply" sending profile. | Dynamic distance filters, auto-matching score, employer applicant pipeline tracker. | Predictive gig pricing, bidding mechanisms for high-demand worker niches. |
| **Learning** | Link to external YouTube tutorial playlists for target trades. | Native micro-learning engine: vertical video uploads, visual quizzes, certificates. | Interactive AR (Augmented Reality) training simulations on mobile screens. |
| **Chat & Comms** | Direct WhatsApp redirect chat buttons. | Native double-blind text + voice-note chat, push notifications (FCM). | In-app VOIP calling masked numbers, regional voice-to-text live translations. |
| **Coach & Analytics** | Static salary stats (e.g. "Electricians in Noida earn ₹18k"). | AI Career Coach: analyzing skill gaps, learning roadmap recommendations. | Enterprise analytics dashboard tracking hiring times, churn rates, & compliance. |

---

## 2. Product Development Phases

### Phase A: MVP (Minimum Viable Product)
*   **Goal:** Validate if semi-skilled workers will apply to jobs using a digital passport, and check if employers will hire through digital screening.
*   **Engineering Scope:**
    *   Build a single-page React app (mobile responsive layout) acting as the PWA.
    *   Initialize Node.js + Express backend with MongoDB.
    *   Integrate a standard OTP gateway.
    *   Implement Geo-queries (`$nearSphere`) to fetch jobs matching worker GPS locations.
    *   Provide a basic "WhatsApp Employer" button to initiate communications, bypassing early complex socket pipelines.

### Phase B: V1 Release (Core Scaling & AI Engine)
*   **Goal:** Automate trust verification, enhance core engagement via micro-learning, and optimize the applicant pipeline.
*   **Engineering Scope:**
    *   **Asynchronous AI Assessment Pipeline:** User hits record -> audio sent to S3 -> background BullMQ worker extracts audio -> Whisper API generates text -> LLM evaluates text against criteria -> updates DB with skill scores and badge triggers.
    *   **Native Real-time Chat:** Replace WhatsApp buttons with custom socket.io services. Support audio voice notes directly inside chats (crucial for semi-skilled workers who prefer talking over typing).
    *   **PDF Passport Renderer:** Visual canvas compiled server-side and exported to S3 for easy worker sharing.
    *   **Micro-learning Module:** Admin panel to upload custom courses, student enrollment models, progress trackers, and certificate generator.

### Phase C: Future Scale & Enterprise
*   **Goal:** Monetize through enterprise staffing pipelines, optimize recommendation models, and improve retention.
*   **Engineering Scope:**
    *   **Enterprise SaaS Portal:** Multi-tenant dashboard for agencies managing 1,000+ blue-collar workers.
    *   **Algorithmic Matching Engine:** Train ranking models based on candidate assessment scores, job proximity, past performance reviews, and reliability/attendance signals.
    *   **AI Vernacular Coach:** Conversational voice bot providing personalized career advice, automated simulated interview preparation, and localized wage negotiation training.
