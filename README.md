# WORLDGUARD

*Authorized, evidence-driven security assessment framework.*

## Overview
WORLDGUARD automates vulnerability detection, controlled validation, risk assessment, remediation guidance, and security reporting for web applications and APIs.

## Running the Prototype

### 1. Start the Backend (FastAPI)
```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```
*The backend will run on http://localhost:8000*

### 2. Start the Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
*The frontend will typically run on http://localhost:5173*

## Current Status (MVP Scaffolding)
- [x] Initialized FastAPI Backend (Python/Uvicorn/SQLite ready)
- [x] Initialized React Frontend (Vite/Tailwind CSS)
- [x] Basic Assessment API & Mock Findings Endpoint
- [x] React Dashboard for SIH demo flow
