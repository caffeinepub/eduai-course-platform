# EduAI Free Course Platform

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User signup/login with age verification (must be 18+), stored in backend database
- Single hardcoded admin account (one fixed email)
- Course creation: only registered users (18+) can create courses; price is always 0
- Course structure: at least 3 video sessions (YouTube/Vimeo embed URLs), plus optional PDF, image, or text content per lesson
- Category management: course creators can add categories; admin can add or delete any category
- Course search by title/category
- AI-powered quiz auto-generated for every course using Gemini API (HTTP outcalls)
- AI doubt-solving chatbot per course using Gemini API (HTTP outcalls)
- Seasonal/festival UI themes that change automatically based on current date
- SEO meta tags for Google discoverability
- Role-based access: admin role, creator role, student role

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - User registration with DOB field, age check (>=18 to create/upload), password hash
   - Admin: single hardcoded principal/email; can manage categories and delete content
   - Course CRUD: title, description, category, price (locked to 0), creatorId
   - Lesson model: videoUrl (embed), lessonType (video/pdf/image/text), content
   - Category CRUD
   - Quiz model: courseId, questions (AI-generated, stored after first generation)
   - Doubt/chat: per-course Q&A stored messages, Gemini HTTP outcall for answers
   - HTTP outcalls to Gemini API for quiz generation and doubt solving
   - Search: filter courses by title keyword and category

2. Frontend (React + TypeScript + Tailwind):
   - Auth pages: signup (with DOB), login
   - Home: search bar, category filter, course cards grid
   - Course detail: video player sessions, PDF/image/text content, AI quiz section, AI doubt chat
   - Course creation form: title, description, category, add lessons (video URL + optional PDF/image/text)
   - Admin dashboard: category management, course/user management
   - Seasonal theme: detect current month/date, apply festival color palette (Holi, Diwali, Christmas, New Year, etc.)
   - SEO: meta tags in index.html
