# API Service

This is the backend service for the chat application. It handles LLM interactions and provides a REST API for the frontend.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the server:
```bash
uvicorn main:app --reload --port 8000
```

## Environment Variables

Create a `.env` file with:

```
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Available Endpoints

- POST `/api/chat`: Send chat messages to LLM models
  - Supports OpenAI, Anthropic, and Ollama models
  - Requires model selection and question in request body