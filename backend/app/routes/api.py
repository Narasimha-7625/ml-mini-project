"""FastAPI REST API endpoints for Customer Segmentation."""

import io
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response
from pydantic import BaseModel, Field
import pandas as pd

from ..services.cluster_service import cluster_service

router = APIRouter(prefix="/api", tags=["Machine Learning"])


class ClusterRequest(BaseModel):
    k: int = Field(default=5, ge=2, le=10, description="Number of clusters (K)")
    features: Optional[List[str]] = Field(
        default=None, description="List of numerical feature column names to use"
    )


class ElbowRequest(BaseModel):
    features: Optional[List[str]] = Field(
        default=None, description="Optional custom feature columns for elbow analysis"
    )


class PredictionInput(BaseModel):
    Age: float = Field(default=35, ge=16, le=100)
    AnnualIncome: float = Field(default=60000, ge=1000)
    SpendingScore: float = Field(default=50, ge=1, le=100)
    PurchaseFrequency: float = Field(default=12, ge=0)
    AverageOrderValue: float = Field(default=120, ge=1)
    WebsiteVisits: float = Field(default=15, ge=0)
    CustomerLoyaltyYears: float = Field(default=2, ge=0)


@router.get("/health")
def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "healthy",
        "service": "Customer Segmentation K-Means ML Engine",
        "k_clusters": cluster_service.k,
        "features": cluster_service.selected_features,
    }


@router.get("/sample-data")
def load_sample_dataset():
    """Loads the pre-bundled synthetic customers.csv dataset and triggers default clustering."""
    try:
        cluster_service.load_sample_data()
        summary = cluster_service.get_summary()
        return {
            "success": True,
            "message": "Sample customer dataset loaded successfully.",
            "summary": summary,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Uploads and validates a custom customer CSV dataset."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV file.")

    try:
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    try:
        result = cluster_service.set_dataset_from_df(df)
        return {
            "success": True,
            "message": f"Successfully parsed {result['total_rows']} customer records.",
            "data": result,
            "summary": cluster_service.get_summary(),
        }
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/elbow")
def calculate_elbow(request: ElbowRequest = ElbowRequest()):
    """Calculates inertia for K=2 to 10 to assist in selecting optimal K."""
    try:
        result = cluster_service.compute_elbow(request.features)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cluster")
def execute_clustering(request: ClusterRequest):
    """Executes K-Means with specified K and selected features."""
    try:
        summary = cluster_service.run_clustering(k=request.k, features=request.features)
        return {
            "success": True,
            "message": f"K-Means successfully clustered customers into {request.k} segments.",
            "summary": summary,
        }
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict")
def predict_customer(input_data: PredictionInput):
    """Assigns an incoming customer record to the nearest cluster centroid."""
    try:
        features_dict = input_data.model_dump()
        result = cluster_service.predict_customer(features_dict)
        return {
            "success": True,
            "customer_input": features_dict,
            "prediction": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cluster-summary")
def get_cluster_summary():
    """Retrieves current cluster metadata, centroids, scatter points, and recommendations."""
    summary = cluster_service.get_summary()
    return summary


@router.get("/customers")
def get_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    cluster: Optional[int] = None,
    sort_by: Optional[str] = "CustomerID",
    sort_order: Optional[str] = "asc",
):
    """Retrieves paginated, searchable, filterable, and sortable customer records with cluster assignments."""
    if cluster_service.df_clustered is None:
        raise HTTPException(status_code=400, detail="No clustered data available. Please load dataset.")

    df = cluster_service.df_clustered.copy()

    # Filter by cluster
    if cluster is not None and cluster >= 0:
        df = df[df["Cluster"] == cluster]

    # Search filter
    if search:
        search_lower = search.lower()
        mask = (
            df["CustomerID"].astype(str).str.lower().str.contains(search_lower)
            | df["Segment"].astype(str).str.lower().str.contains(search_lower)
        )
        if "Gender" in df.columns:
            mask = mask | df["Gender"].astype(str).str.lower().str.contains(search_lower)
        df = df[mask]

    # Sorting
    if sort_by and sort_by in df.columns:
        ascending = sort_order.lower() == "asc"
        df = df.sort_values(by=sort_by, ascending=ascending)

    total_records = len(df)
    total_pages = max(1, (total_records + limit - 1) // limit)

    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_data = df.iloc[start_idx:end_idx].to_dict(orient="records")

    return {
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": total_pages,
        "data": page_data,
    }


@router.get("/download")
def download_clustered_dataset():
    """Exports and streams the full dataset with assigned clusters as a CSV file."""
    if cluster_service.df_clustered is None:
        raise HTTPException(status_code=400, detail="No clustered dataset available.")

    csv_buffer = io.StringIO()
    cluster_service.df_clustered.to_csv(csv_buffer, index=False)
    csv_bytes = csv_buffer.getvalue().encode("utf-8")

    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=clustered_customers.csv"},
    )
