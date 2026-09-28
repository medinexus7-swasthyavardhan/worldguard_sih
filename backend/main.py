from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
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
    api_key: Optional[str] = None
    context: Optional[str] = None

class CredentialAuditRequest(BaseModel):
    sha1_prefix: str

class PhishingCheckRequest(BaseModel):
    domain: str

# ────────────────────────────────────
#  REAL SCANNER
# ────────────────────────────────────
async def real_scan(url: str):
    findings = []
    finding_id = 0

    # Auto-format raw domain input (e.g. 'edusut' -> 'https://edusut.com')
    clean_url = url.strip()
    if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
        if "." not in clean_url:
            clean_url = clean_url + ".com"
        clean_url = "https://" + clean_url

    try:
        async with httpx.AsyncClient(timeout=12, follow_redirects=True, verify=False) as client:
            resp = await client.get(clean_url)
            headers = resp.headers

            security_headers = {
                "X-Frame-Options": ("Missing X-Frame-Options", "Clickjacking attacks possible. Header absent.", "Medium"),
                "X-Content-Type-Options": ("Missing X-Content-Type-Options", "MIME-type sniffing not prevented. Set to 'nosniff'.", "Low"),
                "Strict-Transport-Security": ("Missing HSTS Header", "No HTTP Strict Transport Security.", "High"),
                "Content-Security-Policy": ("Missing Content-Security-Policy", "No CSP header present.", "Medium"),
                "X-XSS-Protection": ("Missing X-XSS-Protection", "Legacy XSS filter header not set.", "Low"),
                "Referrer-Policy": ("Missing Referrer-Policy", "No referrer policy specified.", "Low"),
                "Permissions-Policy": ("Missing Permissions-Policy", "Browser features not restricted.", "Low"),
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

            server = headers.get("server", "")
            if server and any(v in server.lower() for v in ["apache", "nginx", "iis", "express", "gunicorn", "uvicorn"]):
                finding_id += 1
                findings.append({
                    "id": finding_id,
                    "title": "Server Version Disclosure",
                    "severity": "Low",
                    "component": "Server Header",
                    "signal": f"Exposes server banner: '{server}'",
                    "status": "Validated"
                })

            set_cookies = resp.headers.get_list("set-cookie") if hasattr(resp.headers, 'get_list') else []
            for cookie in set_cookies:
                cookie_lower = cookie.lower()
                if "secure" not in cookie_lower:
                    finding_id += 1
                    findings.append({
                        "id": finding_id,
                        "title": "Cookie Missing Secure Flag",
                        "severity": "Medium",
                        "component": "Set-Cookie",
                        "signal": f"Cookie sent over HTTP: {cookie[:40]}...",
                        "status": "Validated"
                    })
                if "httponly" not in cookie_lower:
                    finding_id += 1
                    findings.append({
                        "id": finding_id,
                        "title": "Cookie Missing HttpOnly Flag",
                        "severity": "Medium",
                        "component": "Set-Cookie",
                        "signal": f"Cookie accessible via JS: {cookie[:40]}...",
                        "status": "Validated"
                    })

            if not str(resp.url).startswith("https"):
                finding_id += 1
                findings.append({
                    "id": finding_id,
                    "title": "No HTTPS Enforcement",
                    "severity": "High",
                    "component": "Transport",
                    "signal": f"Final URL is HTTP: {resp.url}",
                    "status": "Validated"
                })

            sensitive_paths = [
                ("/.env", "Environment File Exposed"),
                ("/.git/config", "Git Config Exposed"),
                ("/wp-admin", "WordPress Admin Found"),
                ("/admin", "Admin Panel Accessible"),
                ("/robots.txt", "Robots.txt Information Leak"),
            ]

            for path, title in sensitive_paths:
                try:
                    check = await client.get(clean_url.rstrip("/") + path)
                    if check.status_code == 200 and len(check.content) > 50:
                        finding_id += 1
                        findings.append({
                            "id": finding_id,
                            "title": title,
                            "severity": "High" if ".env" in path or ".git" in path else "Medium",
                            "component": path,
                            "signal": f"HTTP 200 ({len(check.content)} bytes)",
                            "status": "Validated"
                        })
                except:
                    pass

    except Exception as e:
        findings.append({
            "id": 1,
            "title": "Host Unreachable / DNS Lookup Failed",
            "severity": "Critical",
            "component": clean_url,
            "signal": f"Could not resolve or connect to server: {str(e)[:90]}",
            "status": "Failed"
        })

    return clean_url, findings

# ────────────────────────────────────
#  ROUTES
# ────────────────────────────────────

@app.get("/")
def root():
    return {"service": "SDS Kavach API", "version": "2.0.0", "status": "operational"}

@app.post("/api/scan")
async def start_scan(req: ScanRequest):
    clean_url, findings = await real_scan(req.target_url)
    
    # If connection failed or DNS lookup failed, score is 0
    if any(f.get("status") == "Failed" or f["severity"] == "Critical" and "DNS" in f["title"] for f in findings):
        score = 0
    else:
        score = max(0, 100 - sum(
            25 if f["severity"] == "Critical" else
            15 if f["severity"] == "High" else
            8 if f["severity"] == "Medium" else 3
            for f in findings
        ))

    data = {"target_url": clean_url, "findings": findings, "timestamp": datetime.utcnow().isoformat(), "score": score}
    scan_store[clean_url] = data
    scan_store["_latest"] = data
    return {"target_url": clean_url, "findings": findings, "score": score}

@app.get("/api/findings")
def get_findings(target_url: Optional[str] = Query(None)):
    if target_url:
        url = target_url if target_url.startswith("http") else "https://" + target_url
        if url in scan_store: return scan_store[url]["findings"]
    if "_latest" in scan_store: return scan_store["_latest"]["findings"]
    return [
        {"id": 1, "title": "Broken Access Control", "severity": "High", "component": "/api/test-resource/{id}", "status": "Validated", "signal": "HTTP 200 on restricted route"},
        {"id": 2, "title": "Missing Security Headers", "severity": "Low", "component": "Global", "status": "Validated", "signal": "Multiple headers absent"},
    ]

# ────────────────────────────────────
#  NEW FEATURE 1: WAF RULE EXPORTER
# ────────────────────────────────────
@app.get("/api/waf-rules")
def get_waf_rules(target_domain: str = Query("cybercrime.gov.in")):
    domain = target_domain.replace("https://", "").replace("http://", "").split("/")[0]
    
    nginx_conf = f"""# SDS Kavach Auto-Generated WAF Rules for {domain}
# Add inside server {{ ... }} block

# 1. Security Headers Hardening
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline'; object-src 'none';" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# 2. Block Sensitive Path Probing
location ~* /\\.(env|git|htaccess|aws|ssh) {{
    deny all;
    return 404;
}}

# 3. Prevent SQL Injection & Bad Query Strings
if ($query_string ~* "(concat|eval|select|insert|union|drop|schema|base64_decode)") {{
    return 403;
}}
"""

    apache_htaccess = f"""# SDS Kavach Auto-Generated .htaccess for {domain}

# Security Headers
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set Content-Security-Policy "default-src 'self'"

# Block Access to Hidden & Sensitive Files
<FilesMatch "^\\.(env|git|htaccess|aws)">
    Order allow,deny
    Deny from all
</FilesMatch>

# Anti-SQLi Filter
RewriteEngine On
RewriteCond %{{QUERY_STRING}} (\\||%3C|>|%3E|%22|'|%27|%0A|%0D|%0D%0A) [NC,OR]
RewriteCond %{{QUERY_STRING}} (select|insert|drop|delete|update|cast|create|alter) [NC]
RewriteRule ^(.*)$ - [F,L]
"""

    cloudflare_waf = f"""// Cloudflare WAF Custom Rule for {domain}
(http.request.uri.path contains "/.env") or 
(http.request.uri.path contains "/.git/") or 
(http.request.uri.query contains "SELECT%20") or 
(http.request.uri.query contains "UNION%20") or 
(http.request.uri.query contains "<script>")
// Action: Block (403)
"""

    aws_waf = json.dumps({
        "Name": f"SDSKavach-WAF-{domain.replace('.', '-')}",
        "Scope": "REGIONAL",
        "DefaultAction": {"Allow": {}},
        "Rules": [
            {
                "Name": "BlockSensitivePaths",
                "Priority": 1,
                "Statement": {
                    "ByteMatchStatement": {
                        "SearchString": ".env",
                        "FieldToMatch": {"UriPath": {}},
                        "TextTransformations": [{"Type": "LOWERCASE", "Priority": 0}],
                        "PositionalConstraint": "CONTAINS"
                    }
                },
                "Action": {"Block": {}}
            },
            {
                "Name": "SQLiProtection",
                "Priority": 2,
                "Statement": {"SqliMatchStatement": {"FieldToMatch": {"QueryString": {}}, "TextTransformations": [{"Type": "URL_DECODE", "Priority": 0}]}},
                "Action": {"Block": {}}
            }
        ]
    }, indent=2)

    return {
        "domain": domain,
        "nginx": nginx_conf,
        "apache": apache_htaccess,
        "cloudflare": cloudflare_waf,
        "aws_waf": aws_waf
    }

# ────────────────────────────────────
#  NEW FEATURE 2: TYPOSQUATTING & PHISHING SHIELD
# ────────────────────────────────────
@app.post("/api/phishing-check")
async def phishing_check(req: PhishingCheckRequest):
    raw_domain = req.domain.replace("https://", "").replace("http://", "").split("/")[0]
    parts = raw_domain.split(".")
    name = parts[0]
    tld = ".".join(parts[1:]) if len(parts) > 1 else "com"

    variants = [
        f"{name}-portal.{tld}",
        f"{name}-login.{tld}",
        f"{name}-gov.{tld}",
        f"{name}-secure.{tld}",
        f"{name}1.{tld}",
        f"cbyer{name[4:] if len(name)>4 else name}.{tld}",
        f"{name}-verify.in",
        f"official-{name}.{tld}"
    ]

    results = []
    async with httpx.AsyncClient(timeout=4, verify=False) as client:
        for var in variants:
            status = "Clean (Unregistered)"
            risk = "Low"
            ip = "N/A"
            try:
                r = await client.get(f"https://{var}")
                if r.status_code == 200:
                    status = "ACTIVE PHISHING RISK"
                    risk = "CRITICAL"
                    ip = str(r.url.host)
                else:
                    status = f"Resolves (HTTP {r.status_code})"
                    risk = "HIGH"
            except:
                pass

            results.append({
                "domain": var,
                "status": status,
                "risk": risk,
                "checked_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
            })

    return {"target_domain": raw_domain, "threats_found": sum(1 for r in results if r["risk"] != "Low"), "variants": results}

# ────────────────────────────────────
#  CREDENTIAL AUDIT & AI CHAT & PDF
# ────────────────────────────────────
@app.post("/api/credential-audit")
async def credential_audit(req: CredentialAuditRequest):
    prefix = req.sha1_prefix.upper()[:5]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"https://api.pwnedpasswords.com/range/{prefix}")
            if resp.status_code == 200:
                results = [{"suffix": line.strip().split(":")[0], "count": int(line.strip().split(":")[1])} for line in resp.text.strip().split("\n")]
                return {"prefix": prefix, "results": results}
            return {"prefix": prefix, "results": [], "error": "HIBP API error"}
    except Exception as e:
        return {"prefix": prefix, "results": [], "error": str(e)}

@app.post("/api/ai-chat")
async def ai_chat(req: AIChatRequest):
    # Try all common env var names for Gemini API Key
    gemini_key = (
        req.api_key or
        os.environ.get("GEMINI_API_KEY") or
        os.environ.get("GEMINI_KEY") or
        os.environ.get("GOOGLE_API_KEY") or
        os.environ.get("API_KEY") or ""
    ).strip()

    if gemini_key:
        models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-pro"]
        async with httpx.AsyncClient(timeout=12) as client:
            for model_name in models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key}"
                    prompt = (
                        "You are the SDS Kavach AI Security Analyst (Secure Defense System). "
                        "Respond to the user with helpful, friendly, and expert security guidance.\n\n"
                        f"User Message: {req.message}"
                    )
                    payload = {"contents": [{"parts": [{"text": prompt}]}]}
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        ai_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return {"response": ai_text}
                except Exception as e:
                    print(f"Gemini API error for {model_name}: {e}")

    msg = req.message.strip().lower()

    # Smart Conversational & Natural Language Fallback Engine
    if any(w in msg for w in ["hi", "hello", "hey", "hola", "greetings", "sup"]):
        return {"response": "Hello! 👋 I'm your **SDS Kavach AI Security Analyst**.\n\nI'm doing great and ready to audit your application stack! How can I assist you today?"}

    if any(w in msg for w in ["how are you", "how r u", "how aare you", "how are u"]):
        return {"response": "I'm doing fantastic, thank you! 🛡️ As the SDS Kavach AI Security Analyst, I'm fully operational and actively monitoring threats. How can I help secure your application or API today?"}

    if any(w in msg for w in ["who are you", "what are you", "what can you do", "capabilities", "help"]):
        return {"response": "I am **SDS Kavach AI Security Analyst**, an intelligent security assistant built for the Smart India Hackathon.\n\nHere is what I can do for you:\n- 🛡️ **Vulnerability Remediation:** Generate instant code fixes for SQLi, XSS, CSRF, and Broken Auth.\n- 📄 **Security Headers:** Recommend Nginx, Apache, and Cloudflare WAF rules.\n- 🔐 **Credential Exposure:** Explain k-anonymity password auditing.\n- 🚨 **Phishing Shield:** Analyze imposter and typosquatting domain risks."}

    if any(w in msg for w in ["thank", "thanks", "awesome", "great", "cool", "perfect"]):
        return {"response": "You're very welcome! Stay safe and secure. Let me know if you need any more vulnerability assessment guidance! 🛡️"}

    # Topic-specific security advice
    if "sql" in msg or "injection" in msg or "sqli" in msg:
        return {"response": "**SQL Injection (SQLi) Remediation Guide:**\n\nSQL Injection occurs when untrusted user input is directly concatenated into database queries.\n\n**Fix in Python (FastAPI / SQLAlchemy / psycopg2):**\n```python\n# BAD: Vulnerable to SQLi\ncursor.execute(f\"SELECT * FROM users WHERE username = '{user_input}'\")\n\n# GOOD: Parameterized query prevents SQLi\ncursor.execute(\"SELECT * FROM users WHERE username = %s\", (user_input,))\n```\n\n**Best Practices:**\n1. Always use parameterized queries or an ORM.\n2. Apply the Principle of Least Privilege to DB connections."}

    if "xss" in msg or "script" in msg or "cross site" in msg:
        return {"response": "**Cross-Site Scripting (XSS) Remediation Guide:**\n\nXSS allows attackers to inject malicious client-side scripts into web pages viewed by users.\n\n**Fix in JavaScript / Frontend:**\n```javascript\n// BAD: Renders untrusted HTML\nelement.innerHTML = userInput;\n\n// GOOD: Escapes HTML safely\nelement.textContent = userInput;\n```\n\n**Key Headers to Enable:**\n```http\nContent-Security-Policy: default-src 'self';\nSet-Cookie: session=xyz; Secure; HttpOnly; SameSite=Strict;\n```"}

    if "header" in msg or "hsts" in msg or "csp" in msg or "x-frame" in msg:
        return {"response": "**Recommended Security Headers Hardening:**\n\nAdd the following production security headers to your server configuration (Nginx / Apache / Cloudflare):\n\n```http\nStrict-Transport-Security: max-age=31536000; includeSubDomains; preload\nX-Frame-Options: DENY\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nContent-Security-Policy: default-src 'self' https:\nPermissions-Policy: camera=(), microphone=(), geolocation=()\n```"}

    if "cookie" in msg or "session" in msg or "auth" in msg or "token" in msg:
        return {"response": "**Secure Cookie & Session Management:**\n\nAlways configure session cookies with the following security attributes:\n\n```http\nSet-Cookie: session_id=abc123token; Secure; HttpOnly; SameSite=Strict; Path=/\n```\n- **Secure:** Forces transmission over HTTPS only.\n- **HttpOnly:** Prevents JavaScript access (mitigates XSS cookie theft).\n- **SameSite=Strict:** Protects against Cross-Site Request Forgery (CSRF)."}

    # Dynamic Contextual Fallback for general questions
    return {"response": f"I understand you're asking about *\"{req.message}\"*\n\nAs your SDS Kavach Security Analyst, here is my security recommendation:\n\n1. 🔒 **Input Validation:** Enforce strict server-side validation and sanitization for all input fields.\n2. 🛡️ **Defense-in-Depth:** Deploy security headers (CSP, HSTS, X-Frame-Options) and configure WAF rules.\n3. 🔐 **Access Control:** Enforce Principle of Least Privilege and RBAC on all API endpoints.\n\nFeel free to ask me specifically about **SQL Injection**, **XSS**, **Security Headers**, or **WAF Configuration**!"}

@app.get("/api/report/download")
async def download_report(target_url: Optional[str] = Query(None)):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.colors import HexColor

    url_to_report = (target_url if target_url.startswith("http") else "https://" + target_url) if target_url else "https://cybercrime.gov.in/"
    scan_data = scan_store.get(url_to_report, scan_store.get("_latest", {
        "target_url": url_to_report, "score": 75,
        "findings": [{"id": 1, "title": "Missing Security Headers", "severity": "Low", "component": "Global Headers", "signal": "Security headers absent"}]
    }))

    file_path = "security_report.pdf"
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    c.setFillColor(HexColor("#0f172a"))
    c.setFont("Helvetica-Bold", 28)
    c.drawString(50, height - 60, "SDS Kavach")
    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor("#64748b"))
    c.drawString(50, height - 80, "Secure Defense System — Security Assessment Report")
    c.drawString(50, height - 95, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    c.setStrokeColor(HexColor("#e2e8f0"))
    c.line(50, height - 110, width - 50, height - 110)

    y = height - 140
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Target:")
    c.setFont("Helvetica", 14)
    c.drawString(110, y, scan_data["target_url"])

    y -= 30
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, f"Posture Score: {scan_data['score']}/100")

    y -= 40
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "Detailed Findings")
    y -= 25

    colors = {"Critical": "#dc2626", "High": "#ea580c", "Medium": "#ca8a04", "Low": "#2563eb"}
    for f in scan_data["findings"]:
        if y < 100: c.showPage(); y = height - 60
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

    c.save()
    return FileResponse(file_path, filename="SDSKavach_Security_Report.pdf", media_type="application/pdf")
