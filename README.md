# Phishing Simulation & Awareness Portal

## 1. Overview

This project is a **web-based phishing simulation and awareness portal** designed to let staff or students safely experience phishing emails and learn how to recognise them. The platform is designed for educational use and is operated in a controlled environment, aimed to improve cybersecurity awareness, whilst avoiding real user security risks. It provides tangible insights into user behaviour to predict future phishing attacks, which meets organisation security requirements.

The system allows an administrator, instructor or a viewer to:

- Create and schedule phishing campaigns.
- Send templated phishing emails with personalised variables.
- Track when emails are **opened, clicked, or reported**.
- Show a **landing page** explaining why the email was suspicious.
- View a **dashboard** with core metrics (open, click, report rates).
- Generates reports to evaluate user awareness trends and identify areas needing fixes.

> **Note:** The original brief suggested PostgreSQL. For simplicity and to align with my current skills, this implementation uses **MySQL (via XAMPP + phpMyAdmin)** instead. This choice is explained in the Technology Stack section.

---

## 2. Features vs Coursework Requirements

### Core Features (Must-Have)

These features are aligned with our coursework requirements and demonstrate the implemntation of the core backend, database and the web application covered in the moduke:
-  **Create phishing campaigns**  
  Admin/Instructor can create campaigns with:
  - Campaign name
  - Email subject
  - HTML email body (supports variables like `{{link}}`, `{{recipient_email}}`)
  - A list of recipients (one email per line)

-  **Schedule campaigns**  
  Campaigns include a `scheduled_at` field in the database. For Week 2 scope, scheduling is stored and validated; sending can be triggered manually from the dashboard.

-  **Unique tracking links**  
  Each recipient gets a unique `tracking_token` (UUID). This token is used to:
  - Track opens: `/track/:token` (tracking pixel)
  - Track clicks: `/click/:token` (redirect through backend)
  - Track reports: `/report/:token` (when user reports the email)
This approach ensures accuracy in user tracking whilst maintaining individuality between users.

-  **Landing page with indicators**  
  When a user clicks a phishing link, they are redirected to an **Education Landing Page** explaining:
  - Why the email was suspicious
  - Common phishing indicators
  - Safe practices

-  **Dashboard metrics**  
  Dashboard displays:
  - Total campaigns
  - Total recipients
  - Open rate, click rate, report rate
  - Basic chart of campaign performance
  - Data derived from logged tracking events stored in the database

---

### Security Requirements

These requirements are designed to protect system and data integrity, whilst implementing necessary functionalities:
-  **Role-Based Access Control (RBAC)**  
  Roles:
  - **Admin** – full control: manage users, campaigns, launch/delete campaigns.
  - **Instructor** – create and launch campaigns, view analytics.
  - **Viewer** – read-only access to dashboards and campaign lists.

-  **Input sanitisation**  
  - `express-validator` used on backend routes to validate and sanitise inputs.
  - Dangerous characters are stripped or escaped before being stored or rendered.
  All of which reduces the risk of injection and other attacks.

-  **CSRF protection**  
  - `csurf` middleware applied to write operations (e.g. campaign creation, launch).
  - CSRF token is issued and checked for authenticated sessions.

-  **Separation of campaign data vs results**  
  Database tables:
  - `campaigns` – campaign configuration.
  - `recipients` – recipients per campaign, with tracking token.
  - `events` – each open / click / report stored separately.

-  **Audit log of admin actions**  
  - `audit_logs` table records:
    - user id
    - action (e.g. `CREATE_CAMPAIGN`, `LAUNCH_CAMPAIGN`, `DELETE_CAMPAIGN`, `LOGIN`)
    - resource type & id
    - timestamp and IP
Audit logs are good as they offer traceability and accountability for security risked operations.

---

### Non-Functional Requirements

- **Handle 1,000 recipients per campaign**  
  - Backend validation prevents more than 1,000 recipients per campaign.
  - MySQL indexes on `campaign_id`, `recipient_id`, and timestamps for efficient queries.

-  **Page loads under 2 seconds for dashboard with 10k events**  
  - Indexes on key columns (`events.timestamp`, `events.recipient_id`) support faster aggregation.
  - Dashboard queries are simplified to count and group events, reducing heavy joins.

---

## 3. Technology Stack

These technologies prioritise securiy, efficiency and individuality for the courssework requirements:
### Frontend

- **React** (Create React App)
- **React Router** for routing (`/login`, `/dashboard`, `/campaigns/:id`, etc.)
- **Axios** for HTTP requests
- **Recharts** for basic graphs/visualisations
- **Tailwind CSS** for styling utility classes
  
### Backend

- **Node.js** + **Express**
- **MySQL** (via `mysql2` package)
- **JWT** for authentication
- **bcryptjs** for password hashing
- **helmet** and **cors** for security headers and CORS control
- **express-validator** for validation and sanitisation
- **csurf** for CSRF protection
- **nodemailer** for email sending (configured to work with MailHog during development)

### Database

- **MySQL** (through XAMPP + phpMyAdmin)

> **Justification for MySQL instead of PostgreSQL:**  
> - phpMyAdmin provides a friendly GUI for creating tables, inspecting data, and debugging.  
> - XAMPP bundles Apache, PHP, and MySQL in one installer, reducing setup complexity.  
> - For the scale of this coursework project (single-user development environment), MySQL’s features are sufficient.  
> - I explicitly document this deviation and focus on fulfilling the **functional and security requirements**.

### Mail Sandbox

- **MailHog** (optional, but supported)
  - SMTP host: `localhost`
  - SMTP port: `1025`
  - Web UI: `http://localhost:8025`
  - All outgoing emails are captured in MailHog instead of the real internet.
  This ensures that phishing simulations can be tested safely without delivering emails to the actual users.
---

## 4. Prerequisites

- Node.js (LTS)
- npm
- XAMPP (Apache + MySQL + phpMyAdmin)
- Git (optional, for version control)
- MailHog (optional, for realistic email testing)

---

## 5. Installation & Setup
Installation & Setup
Step 1 – Clone or Download the Project
git clone https://github.com/<your-username>/Secure-Software-Development.git
cd phishing-portal


Alternatively, download the ZIP and extract it locally.

Step 2 – Backend Setup
cd backend
npm install


Create a .env file in the backend directory:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=phishing_portal
JWT_SECRET=supersecretkey
FRONTEND_URL=http://localhost:3000


Start the backend:

npm run dev


Confirm the backend is running:

http://localhost:5000/health

Step 3 – Frontend Setup
cd frontend
npm install
npm start

Open:

http://localhost:3000/login

Step 4 – Database Setup

Start XAMPP

Enable MySQL

Open phpMyAdmin

Create database: phishing_portal

Import the provided SQL schema

---

## 6. Threat Model (STRIDE Methodology)

### 6.1 Threat Modelling Methodology

This project uses the **STRIDE threat modelling framework**, which categorises threats into six classes:

- **S**poofing  
- **T**ampering  
- **R**epudiation  
- **I**nformation Disclosure  
- **D**enial of Service  
- **E**levation of Privilege  

STRIDE was selected because the system includes authenticated users, public-facing tracking endpoints, role-based access control, and sensitive administrative actions. This methodology provides a structured and systematic approach to identifying risks within the phishing simulation domain.

---

### 6.2 System Overview and Attack Surface

#### System Components

- React frontend (login, dashboard, campaign creation, education page)
- Node.js + Express backend
- MySQL database
- Public tracking endpoints:
  - `/track/:token`
  - `/click/:token`
  - `/report/:token`

#### Attack Surface Analysis

| Component | Description |
|---------|------------|
| Authentication | Login endpoint accepting user credentials |
| Campaign Management | Create, launch, delete campaign actions |
| Tracking Endpoints | Public token-based URLs |
| Database | Stores campaign, recipient, and event data |
| Frontend | User input forms and routing |

---

### 6.3 Threat Identification (STRIDE)

#### Spoofing

**Threat:** An attacker attempts to impersonate an admin or instructor.  

**Mitigation:** Password hashing (bcrypt), JWT authentication, role-based access control.

---

#### Tampering

**Threat:** Modification of campaign or tracking data.  

**Mitigation:** Parameterised SQL queries, backend validation.

---

#### Repudiation

**Threat:** Users deny performing actions such as launching or deleting campaigns.  

**Mitigation:** Audit logging of all sensitive administrative actions.

---

#### Information Disclosure

**Threat:** Exposure of recipient emails or behavioural data.  

**Mitigation:** Token-based tracking and separation of recipients and events.

---

#### Denial of Service

**Threat:** Flooding public tracking endpoints with requests.  

**Mitigation:** Lightweight queries; rate limiting identified as a future enhancement.

---

#### Elevation of Privilege

**Threat:** Viewer attempts to gain admin privileges.  

**Mitigation:** Backend RBAC enforcement and frontend route protection.

---

### 6.4 Risk Matrix

| Threat | Likelihood | Impact | Risk Level |
|------|------------|--------|------------|
| Credential brute force | Medium | High | High |
| Privilege escalation | Low | High | Medium |
| Token enumeration | Low | Medium | Medium |
| Tracking abuse | Medium | Low | Medium |
| Action repudiation | Low | Medium | Low |

---

### 6.5 Attack Scenarios

#### Scenario 1: Credential Brute Force

An attacker repeatedly attempts to guess login credentials.

- **Exploitability:** Medium  
- **Impact:** Full administrative access  
- **Controls:** bcrypt hashing, JWT authentication, recommended rate limiting

---

#### Scenario 2: Tracking Token Guessing

An attacker attempts to guess valid tracking tokens.

- **Exploitability:** Low (UUID randomness)  
- **Impact:** False event generation  
- **Controls:** UUID-based tokens, no sensitive data exposure

---

#### Scenario 3: Privilege Escalation

A viewer attempts to access admin-only endpoints.

- **Exploitability:** Low  
- **Impact:** Campaign manipulation  
- **Controls:** RBAC enforced on backend and frontend

---

### 6.6 Impact Analysis (Business Context)

A successful attack could:

- Undermine trust in security awareness training
- Skew organisational phishing metrics
- Expose staff training behaviour

However, risk is intentionally limited because:

- No real credentials are collected
- A mail sandbox is used
- The platform operates only in training environments

---

### 6.7 Security Testing Plan

- Unit tests for tracking endpoints
- Manual RBAC testing across all roles
- SQL injection attempts (blocked by parameterised queries)
- Audit log verification
- Dashboard performance testing

---

## 7. Technical Security Assessment Report

### 7.1 Executive Summary

This assessment evaluates the security posture of the Phishing Simulation & Awareness Portal, focusing on authentication, access control, tracking mechanisms, and data storage. The system demonstrates a strong baseline security posture appropriate for an educational phishing simulation platform.

---

### 7.2 Assessment Methodology

- Static code analysis of backend routes and controllers
- Manual testing using browser developer tools and Postman
- Database inspection via phpMyAdmin
- STRIDE-based threat modelling
- OWASP Top 10 considerations

---

### 7.3 Security Findings

#### Finding 1: No Login Rate Limiting

**Description:** Login endpoint does not restrict repeated attempts.  

**Impact:** Risk of brute force attacks.  

**CVSS v3.1:** 6.5 (Medium)  

**Recommendation:** Implement `express-rate-limit`.

---

#### Finding 2: Public Tracking Endpoint Abuse

**Description:** Tracking endpoints are publicly accessible.  

**Impact:** Metric manipulation.  

**CVSS v3.1:** 4.3 (Low)  

**Recommendation:** Add rate limiting and monitoring.

---

#### Finding 3: CSRF Tokens Not Required for JWT Header Auth

**Description:** CSRF tokens are not enforced on all forms.  

**Impact:** Low risk due to Authorization header usage.  

**CVSS v3.1:** 3.1 (Low)  

**Recommendation:** Document CSRF design and optionally add origin checks.

---

### 7.4 Evidence

- Screenshots of dashboard metrics
- phpMyAdmin screenshots of `events`, `recipients`, and `audit_logs`
- Backend logs showing audit entries
- Code review of RBAC checks

---

### 7.5 Remediation Summary

- Add rate limiting to login and tracking endpoints
- Log failed authentication attempts
- Implement automated campaign scheduling
- Monitor repeated token usage

---

## 8. Ethical Use and Safeguards

This platform is designed for ethical security awareness training. Safeguards include:

- Clear training disclaimers
- No collection of real credentials
- Use of a mail sandbox
- Immediate educational feedback
- Role-based access control
- Audit logging of admin actions

The system prioritises learning and awareness rather than punishment.

---


