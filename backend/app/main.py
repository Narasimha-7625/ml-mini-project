"""FastAPI application entrypoint for Customer Segmentation Using K-Means Clustering."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.api import router as api_router

app = FastAPI(
    title="Customer Segmentation K-Means API",
    description="Full-stack academic machine learning engine demonstrating customer segmentation with K-Means, StandardScaler, and Elbow Method.",
    version="1.0.0",
)

# Enable CORS for local development across Vite ports (e.g., 3000, 5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include ML API routes
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Customer Segmentation ML Backend is active.",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
