# Project Structure

## Monorepo Layout

```
/
├── backend/          # FastAPI Python backend
├── frontend/         # React TypeScript frontend
└── llm-gemini.py     # Standalone LLM test script
```

## Backend Architecture (`backend/`)

```
backend/
├── main.py                    # FastAPI app entry point, CORS, router registration
├── database.py                # SQLite connection manager and schema initialization
├── requirements.txt           # Python dependencies
├── test_api.py               # API testing script
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── auth.db                   # SQLite database file
├── controllers/              # Business logic layer
│   ├── auth_controller.py
│   └── question_controller.py
├── models/                   # Pydantic models and database schemas
│   └── user.py
├── routes/                   # FastAPI route definitions
│   ├── auth_routes.py
│   └── question_routes.py
└── utils/                    # Shared utilities
    ├── auth.py               # Authentication helpers
    └── gemini_client.py      # LLM client with structured output
```

### Backend Patterns

- **MVC-style architecture**: Routes → Controllers → Utils/Models
- **Dependency injection**: Controllers instantiated in routes
- **Context managers**: Database connections use `@contextmanager` pattern
- **Structured output**: Pydantic models for LLM response validation
- **Error handling**: HTTPException with appropriate status codes
- **CORS**: Configured for `http://localhost:3000` (React dev server)

## Frontend Architecture (`frontend/`)

```
frontend/
├── public/                   # Static assets
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── index.tsx            # React entry point
│   ├── App.tsx              # Main app component with routing logic
│   ├── App.css              # Global styles
│   ├── components/          # React components
│   │   ├── QuizForm.tsx     # Quiz generation form
│   │   └── QuizPage.tsx     # Quiz display and interaction
│   └── setupTests.ts        # Test configuration
├── package.json
└── tsconfig.json
```

### Frontend Patterns

- **Component-based**: Functional components with hooks
- **State management**: useState for local state, props for data flow
- **Type safety**: TypeScript interfaces for props and data structures
- **API calls**: Native fetch API for backend communication
- **Conditional rendering**: Page switching based on state (`form` | `quiz`)

## Key Interfaces

### Question Structure
```typescript
interface Question {
  question: string;
  options: string[];  // Always 4 options
  answer: string;     // Must match one option exactly
}
```

### API Contract
- **Endpoint**: `POST /api/generate-questions`
- **Request**: `{ topic: string, number_questions: number }`
- **Response**: `{ questions: Question[] }`
- **Validation**: Topic 1-200 chars, questions 1-50

## Database Schema

- **users**: id, username, email, password_hash, created_at
- **tokens**: id, user_id, token, created_at (with FK to users)
