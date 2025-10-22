# Technology Stack

## Backend

- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn with standard extras
- **LLM Integration**: LangChain Google GenAI (gemini-2.0-flash-exp model)
- **Database**: SQLite with context manager pattern
- **Validation**: Pydantic v2.7.4+ with structured output
- **Environment**: python-dotenv for configuration

## Frontend

- **Framework**: React 19.1.1 with TypeScript 4.9.5
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Testing**: React Testing Library with Jest
- **Type Safety**: TypeScript with strict mode

## Common Commands

### Backend (from `backend/` directory)

```bash
# Setup virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test API
python test_api.py
```

### Frontend (from `frontend/` directory)

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm start

# Build for production
npm run build

# Run tests (use --run flag for single execution)
npm test -- --run
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Backend requires `.env` file with:
- `GOOGLE_API_KEY`: Google Gemini API key for LLM access
