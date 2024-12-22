from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import api_router
from utils.logging_config import configure_logging
from dotenv import load_dotenv

# Configure logging first
configure_logging()

# Load environment variables
load_dotenv()
load_dotenv(".env.local")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

# Add health check endpoint at root level
@app.get("/health")
async def health_check():
    """Health check endpoint to verify API service status"""
    return {"status": "ok"}