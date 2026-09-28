from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import httpx
import hashlib
import asyncio
import os
import json
from datetime import datetime

app = FastAPI(title="SDS Kavach API", description="Secure Defense System — Security Assessment Framework")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ────────────────────────────────────
#  In-memory store for scan results
# ────────────────────────────────────
scan_store = {}

class ScanRequest(BaseModel):
    target_url: str

class AIChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class CredentialAuditRequest(BaseModel):
    sha1_prefix: str  # First 5 chars of SHA-1 hash (k-anonymity)

# ────────────────────────────────────
#  REAL SCANNER: checks headers, SSL, common vulns
# ────────────────────────────────────
async def real_scan(url: str):
    findings = []
    finding_id = 0

    # Normalize URL
    if not url.startswith("http"):
        url = "https://" + url

    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True, verify=False) as client:
            resp = await client.get(url)
            headers = resp.headers

            # 1. Check Security Headers
            security_headers = {
                "X-Frame-Options": ("Missing X-Frame-Options", "Clickjacking attacks possible. The X-Frame-Options header is not set.", "Medium"),
                "X-Content-Type-Options": ("Missing X-Content-Type-Options", "MIME-type sniffing not prevented. Set to 'nosniff'.", "Low"),
                "Strict-Transport-Security": ("Missing HSTS Header", "No HTTP Strict Transport Security. Browser allows HTTP fallback.", "High"),
                "Content-Security-Policy": ("Missing Content-Security-Policy", "No CSP header. XSS and injection attacks not mitigated by policy.", "Medium"),
                "X-XSS-Protection": ("Missing X-XSS-Protection", "Legacy XSS filter header not set. Modern CSP is preferred.", "Low"),
                "Referrer-Policy": ("Missing Referrer-Policy", "No referrer policy. Sensitive URLs may leak via Referer header.", "Low"),
                "Permissions-Policy": ("Missing Permissions-Policy", "No permissions policy. Browser features like camera/mic not restricted.", "Low"),
            }

            for header_name, (title, signal, severity) in security_headers.items():
                if header_name.lower() not in {k.lower(): v for k, v in headers.items()}:
                    finding_id += 1
                    findings.append({
                        "id": finding_id,
                        "title": title,
                        "severity": severity,
                        "component": "Global Headers",
                        "signal": signal,
                        "status": "Validated"
                    })

            # 2. Check for Server header info leak
            server = headers.get("server", "")
            if server and any(v in server.lower() for v in ["apache", "nginx", "iis", "express", "gunicorn", "uvicorn"]):
                finding_id += 1
                findings.append({
                    "id": finding_id,
                    "title": "Server Version Disclosure",
                    "severity": "Low",
                    "component": "Server Header",
                    "signal": f"Server header exposes: '{server}'",
                    "status": "Validated"
                })

            # 3. Check cookies for Secure/HttpOnly flags
            set_cookies = resp.headers.get_list("set-cookie") if hasattr(resp.headers, 'get_list') else []
            for cookie in set_cookies:
                cookie_lower = cookie.lower()
                if "secure" not in cookie_lower:
                    finding_id += 1
                    findings.append({
                        "id": finding_id,
                        "title": "Cookie Missing Secure Flag",
                        "severity": "Medium",
                        "component": "Set-Cookie Header",
                        "signal": f"Cookie transmitted over HTTP: {cookie[:50]}...",
                        "status": "Validated"
                    })
                if "httponly" not in cookie_lower:
                    finding_id += 1
                    findings.append({
                        "id": finding_id,
                        "title": "Cookie Missing HttpOnly Flag",
                        "severity": "Medium",
                        "component": "Set-Cookie Header",
                        "signal": f"Cookie accessible via JavaScript: {cookie[:50]}...",
                        "status": "Validated"
                    })

            # 4. Check for HTTPS redirect
            if not str(resp.url).startswith("https"):
                finding_id += 1
                findings.append({
                    "id": finding_id,
                    "title": "No HTTPS Enforcement",
                    "severity": "High",
                    "component": "Transport Layer",
                    "signal": f"Final URL is HTTP: {resp.url}",
                    "status": "Validated"
                })

            # 5. Check common sensitive paths
            sensitive_paths = [
                ("/.env", "Environment File Exposed"),
                ("/.git/config", "Git Config Exposed"),
                ("/wp-admin", "WordPress Admin Panel Found"),
                ("/admin", "Admin Panel Accessible"),
                ("/api/docs", "API Documentation Exposed"),
                ("/phpinfo.php", "PHP Info Page Exposed"),
                ("/robots.txt", "Robots.txt Information Leak"),
            ]

            for path, title in sensitive_paths:
                try:
                    check = await client.get(url.rstrip("/") + path)
                    if check.status_code == 200 and len(check.content) > 50:
                        finding_id += 1
                        findings.append({
                            "id": finding_id,
                            "title": title,
                            "severity": "High" if ".env" in path or ".git" in path else "Medium",
                            "component": path,
                            "signal": f"HTTP {check.status_code} with {len(check.content)} bytes response",
                            "status": "Validated"
                        })
                except:
                    pass

            # 6. Check HTTP methods
            try:
                options_resp = await client.options(url)
                allow = options_resp.headers.get("allow", "")
                dangerous_methods = [m for m in ["PUT", "DELETE", "TRACE", "PATCH"] if m in allow.upper()]
                if dangerous_methods:
                    finding_id += 1
                    findings.append({
                        "id": finding_id,
                        "title": "Dangerous HTTP Methods Enabled",
                        "severity": "Medium",
                        "component": "HTTP Methods",
                        "signal": f"Server allows: {', '.join(dangerous_methods)}",
                        "status": "Validated"
                    })
            except:
                pass

    except httpx.ConnectError:
        findings.append({"id": 1, "title": "Connection Failed", "severity": "Critical", "component": url, "signal": "Could not establish connection to target", "status": "Error"})
    except httpx.TimeoutException:
        findings.append({"id": 1, "title": "Connection Timeout", "severity": "High", "component": url, "signal": "Target did not respond within 15 seconds", "status": "Error"})
    except Exception as e:
        findings.append({"id": 1, "title": "Scan Error", "severity": "Medium", "component": url, "signal": str(e)[:120], "status": "Error"})

    return findings

# ────────────────────────────────────
#  ROUTES
# ────────────────────────────────────

@app.get("/")
def root():
    return {"service": "SDS Kavach API", "version": "1.0.0", "status": "operational"}

@app.post("/api/scan")
async def start_scan(req: ScanRequest):
    """Run a real security scan against the target URL."""
    findings = await real_scan(req.target_url)
    scan_id = hashlib.md5(req.target_url.encode()).hexdigest()[:8]
    scan_store[scan_id] = {
        "target_url": req.target_url,
        "findings": findings,
        "timestamp": datetime.utcnow().isoformat(),
        "score": max(0, 100 - sum(
            25 if f["severity"] == "Critical" else
            15 if f["severity"] == "High" else
            8 if f["severity"] == "Medium" else 3
            for f in findings
        ))
    }
    return {"scan_id": scan_id, "findings": findings, "score": scan_store[scan_id]["score"]}

@app.get("/api/findings")
def get_findings():
    """Return most recent scan findings or demo data."""
    if scan_store:
        latest = list(scan_store.values())[-1]
        return latest["findings"]
    return [
        {"id": 1, "title": "Broken Access Control", "severity": "High", "component": "/api/test-resource/{id}", "status": "Validated", "signal": "HTTP 200 on restricted route"},
        {"id": 2, "title": "Missing Security Headers", "severity": "Low", "component": "Global", "status": "Validated", "signal": "Multiple headers absent"},
        {"id": 3, "title": "Reflected XSS", "severity": "Medium", "component": "/search?q=", "status": "Validated", "signal": "Unescaped user input in DOM"},
    ]

@app.post("/api/credential-audit")
async def credential_audit(req: CredentialAuditRequest):
    """Check password against Have I Been Pwned using k-anonymity (prefix only)."""
    prefix = req.sha1_prefix.upper()[:5]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"https://api.pwnedpasswords.com/range/{prefix}")
            if resp.status_code == 200:
                results = []
                for line in resp.text.strip().split("\n"):
                    suffix, count = line.strip().split(":")
                    results.append({"suffix": suffix, "count": int(count)})
                return {"prefix": prefix, "results": results}
            return {"prefix": prefix, "results": [], "error": "HIBP API error"}
    except Exception as e:
        return {"prefix": prefix, "results": [], "error": str(e)}

@app.post("/api/ai-chat")
async def ai_chat(req: AIChatRequest):
    """AI Security Analyst — rule-based responses for common security questions."""
    msg = req.message.lower()

    responses = {
        "sql injection": "**SQL Injection Remediation:**\n\n1. Use parameterized queries / prepared statements\n2. Use an ORM (SQLAlchemy, Prisma)\n3. Validate and sanitize all user inputs\n4. Apply principle of least privilege to DB accounts\n\n```python\n# BAD\ncursor.execute(f\"SELECT * FROM users WHERE id = {user_input}\")\n\n# GOOD\ncursor.execute(\"SELECT * FROM users WHERE id = %s\", (user_input,))\n```",
        "xss": "**XSS Remediation:**\n\n1. Escape all user output in HTML context\n2. Use Content-Security-Policy header\n3. Set `HttpOnly` flag on cookies\n4. Use frameworks that auto-escape (React, Vue)\n\n```javascript\n// BAD\nelement.innerHTML = userInput;\n\n// GOOD\nelement.textContent = userInput;\n```",
        "access control": "**Broken Access Control Fix:**\n\n1. Implement server-side authorization checks on every endpoint\n2. Use role-based access control (RBAC)\n3. Deny by default — only allow explicitly permitted actions\n4. Log and monitor all access control failures\n\n```python\n@app.get(\"/api/resource/{id}\")\ndef get_resource(id: int, user = Depends(get_current_user)):\n    resource = db.get(id)\n    if resource.owner_id != user.id:\n        raise HTTPException(403, \"Forbidden\")\n    return resource\n```",
        "header": "**Missing Security Headers Fix:**\n\nAdd these headers to your server configuration:\n\n```\nX-Frame-Options: DENY\nX-Content-Type-Options: nosniff\nStrict-Transport-Security: max-age=31536000; includeSubDomains\nContent-Security-Policy: default-src 'self'\nReferrer-Policy: strict-origin-when-cross-origin\nPermissions-Policy: camera=(), microphone=(), geolocation=()\n```",
        "hsts": "**HSTS Implementation:**\n\nAdd `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to all HTTPS responses. This forces browsers to only use HTTPS for your domain.",
        "cookie": "**Cookie Security Fix:**\n\nSet these flags on all cookies:\n```\nSet-Cookie: session=abc123; Secure; HttpOnly; SameSite=Strict; Path=/\n```\n- `Secure` — only sent over HTTPS\n- `HttpOnly` — not accessible via JavaScript\n- `SameSite=Strict` — prevents CSRF",
    }

    for keyword, response in responses.items():
        if keyword in msg:
            return {"response": response}

    return {"response": f"I understand you're asking about: *\"{req.message}\"*\n\nBased on the OWASP Top 10 framework, I recommend:\n\n1. **Validate all inputs** on the server side\n2. **Apply least privilege** to all services and users\n3. **Enable security headers** (CSP, HSTS, X-Frame-Options)\n4. **Monitor and log** all security-critical events\n5. **Keep dependencies updated** and scan for known CVEs\n\nWould you like me to generate specific remediation code for a particular vulnerability?"}


@app.get("/api/report/download")
def download_report():
    """Generate PDF report from latest scan results."""
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.colors import HexColor

    file_path = "security_report.pdf"
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    # Header
    c.setFillColor(HexColor("#0f172a"))
    c.setFont("Helvetica-Bold", 28)
    c.drawString(50, height - 60, "SDS Kavach")
    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor("#64748b"))
    c.drawString(50, height - 80, "Secure Defense System — Security Assessment Report")
    c.drawString(50, height - 95, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")

    # Line
    c.setStrokeColor(HexColor("#e2e8f0"))
    c.line(50, height - 110, width - 50, height - 110)

    # Get findings
    if scan_store:
        latest = list(scan_store.values())[-1]
        findings = latest["findings"]
        target = latest["target_url"]
        score = latest["score"]
    else:
        findings = [
            {"id": 1, "title": "Broken Access Control", "severity": "High", "component": "/api/test-resource", "signal": "HTTP 200 on restricted route"},
            {"id": 2, "title": "SQL Injection", "severity": "Critical", "component": "/login", "signal": "Syntax error on payload"},
            {"id": 3, "title": "Missing X-Frame-Options", "severity": "Low", "component": "Global", "signal": "Header absent"},
        ]
        target = "https://cybercrime.gov.in/"
        score = 55

    # Target Info
    y = height - 140
    c.setFillColor(HexColor("#0f172a"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Target:")
    c.setFont("Helvetica", 14)
    c.drawString(110, y, target)

    y -= 30
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, f"Posture Score: {score}/100")

    # Summary
    y -= 40
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "Executive Summary")
    y -= 20
    c.setFont("Helvetica", 11)
    severity_counts = {}
    for f in findings:
        severity_counts[f["severity"]] = severity_counts.get(f["severity"], 0) + 1
    for sev, count in severity_counts.items():
        c.drawString(60, y, f"• {count} {sev} severity finding(s)")
        y -= 18

    # Findings Detail
    y -= 20
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(HexColor("#0f172a"))
    c.drawString(50, y, "Detailed Findings")
    y -= 25

    colors = {"Critical": "#dc2626", "High": "#ea580c", "Medium": "#ca8a04", "Low": "#2563eb"}

    for f in findings:
        if y < 100:
            c.showPage()
            y = height - 60

        c.setFillColor(HexColor(colors.get(f["severity"], "#64748b")))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, f"[{f['severity'].upper()}]")
        c.setFillColor(HexColor("#0f172a"))
        c.drawString(120, y, f["title"])
        y -= 16
        c.setFont("Helvetica", 10)
        c.setFillColor(HexColor("#64748b"))
        c.drawString(60, y, f"Component: {f.get('component', 'N/A')}")
        y -= 14
        c.drawString(60, y, f"Signal: {f.get('signal', 'N/A')}")
        y -= 22

    # Footer
    c.setFont("Helvetica", 8)
    c.setFillColor(HexColor("#94a3b8"))
    c.drawString(50, 30, "SDS Kavach — Authorized Application Security Assessment & Vulnerability Validation Framework")
    c.drawString(width - 150, 30, "Confidential Report")

    c.save()
    return FileResponse(file_path, filename="SDSKavach_Security_Report.pdf", media_type="application/pdf")
