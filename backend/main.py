from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="WORLDGUARD API", description="AI-Assisted Security Assessment Framework")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssessmentRequest(BaseModel):
    target_url: str
    environment: str

@app.get("/")
def read_root():
    return {"message": "Welcome to WORLDGUARD API"}

@app.post("/api/assessments")
def start_assessment(req: AssessmentRequest):
    # Mocking the assessment start process
    return {
        "status": "started",
        "target_url": req.target_url,
        "environment": req.environment,
        "message": "Assessment initiated successfully"
    }

@app.get("/api/findings")
def get_findings():
    # Mock findings for the dashboard
    return [
        {
            "id": 1,
            "title": "Broken Access Control",
            "severity": "High",
            "component": "/api/test-resource/{id}",
            "status": "Validated",
            "category": "Authorization"
        },
        {
            "id": 2,
            "title": "Missing Security Headers",
            "severity": "Low",
            "component": "Global",
            "status": "Validated",
            "category": "Client Security"
        },
        {
            "id": 3,
            "title": "Reflected XSS",
            "severity": "Medium",
            "component": "/search?q=",
            "status": "Validated",
            "category": "Input Validation"
        }
    ]

from fastapi.responses import FileResponse
from reportlab.pdfgen import canvas
import os

@app.get("/api/report/download")
def download_report():
    file_path = "security_report.pdf"
    c = canvas.Canvas(file_path)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, 750, "WORLDGUARD Security Assessment")
    c.setFont("Helvetica", 14)
    c.drawString(100, 710, "Target: https://cybercrime.gov.in/")
    c.drawString(100, 690, "Generated for: I4C / Ministry of Home Affairs")
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 640, "Executive Summary:")
    c.setFont("Helvetica", 12)
    c.drawString(100, 620, "- 2 High Severity Vulnerabilities Detected")
    c.drawString(100, 600, "- 1 Medium Severity Vulnerability Detected")
    
    c.save()
    return FileResponse(file_path, filename="WorldGuard_Security_Report.pdf", media_type="application/pdf")

