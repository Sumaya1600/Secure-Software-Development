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


6. Threat Model (STRIDE Methodology)
6.1 Methodology

This project uses the STRIDE threat modelling framework, which categorises threats into:

Spoofing

Tampering

Repudiation

Information Disclosure

Denial of Service

Elevation of Privilege

STRIDE is suitable for this system because it:

Handles authenticated users with different privilege levels

Stores behavioural security data

Exposes public tracking endpoints

Performs sensitive administrative actions

6.2 System Overview & Attack Surface
Key Components

React frontend (login, dashboard, campaign creation)

Node.js / Express backend

MySQL database

Public tracking endpoints (/track, /click, /report)

Attack Surface
Component	Description
Authentication	Login endpoint
Campaign Management	Create, launch, delete campaigns
Tracking Endpoints	Public token-based endpoints
Database	Campaign, recipient, event storage
Frontend	User-controlled inputs
6.3 Threat Identification (STRIDE)
Spoofing

Threat: Attacker attempts to log in as an admin.
Mitigation: bcrypt password hashing, JWT authentication, RBAC enforcement.

Tampering

Threat: Modification of campaign or event data.
Mitigation: Parameterised SQL queries, backend validation.

Repudiation

Threat: Admin denies performing actions.
Mitigation: Audit logging of all sensitive operations.

Information Disclosure

Threat: Exposure of recipient email addresses.
Mitigation: Token-based tracking, separation of recipients and results.

Denial of Service

Threat: Flooding tracking endpoints.
Mitigation: Lightweight queries; rate limiting noted as future improvement.

Elevation of Privilege

Threat: Viewer gains admin permissions.
Mitigation: Backend RBAC enforcement and frontend route restrictions.

6.4 Risk Matrix
Threat	Likelihood	Impact	Risk
Credential brute force	Medium	High	High
Privilege escalation	Low	High	Medium
Token enumeration	Low	Medium	Medium
Tracking abuse	Medium	Low	Medium
Action repudiation	Low	Medium	Low
6.5 Attack Scenarios

Scenario 1: Brute Force Login
Attacker attempts repeated login attempts.
Mitigated by password hashing and recommended rate limiting.

Scenario 2: Token Guessing
Attacker attempts to guess tracking tokens.
Low exploitability due to UUID randomness.

Scenario 3: Privilege Escalation
Viewer attempts admin actions.
Blocked by RBAC checks and JWT role validation.

6.6 Business Impact Analysis

A successful attack could:

Undermine confidence in security training

Skew awareness metrics

Expose staff behavioural data

Impact is intentionally limited because:

No real credentials are collected

Mail sandbox prevents real email delivery

System is for training use only

6.7 Security Testing Plan

Unit testing of tracking endpoints

Manual RBAC validation

SQL injection attempts

Audit log verification

Dashboard performance testing

7. Technical Security Assessment Report
7.1 Executive Summary

This security assessment evaluates the Phishing Simulation & Awareness Portal, focusing on authentication, access control, tracking mechanisms, and data storage. The application demonstrates a strong security baseline suitable for educational use, with minor areas identified for enhancement.

7.2 Methodology

Manual testing (browser dev tools, Postman)

Static code review

Database inspection (phpMyAdmin)

STRIDE threat modelling

OWASP Top 10 mapping

7.3 Findings
Finding 1: No Login Rate Limiting

Risk: Brute force attempts

Impact: Admin compromise

CVSS: 6.5 (Medium)

Recommendation: Implement express-rate-limit

Finding 2: Public Tracking Endpoint Abuse

Risk: Metric inflation

Impact: Data integrity loss

CVSS: 4.3 (Low)

Recommendation: Add rate limiting and anomaly detection

Finding 3: CSRF Tokens Not Required for JWT Header Auth

Risk: Low due to JWT in Authorization header

CVSS: 3.1 (Low)

Recommendation: Document CSRF design and add origin checks if required

7.4 Evidence

Dashboard screenshots showing metrics

phpMyAdmin screenshots of events, recipients, and audit_logs

Backend logs confirming admin actions

Code review of RBAC checks

7.5 Remediation Summary

Add rate limiting to login and tracking endpoints

Log failed login attempts

Implement automated campaign scheduler (future work)

Add monitoring for repeated token usage

8. Ethical Use & Safeguards (Reflection)

This platform is designed for ethical cybersecurity education, not punishment. Safeguards include:

Clear training disclaimers

No collection of real credentials

Mail sandbox usage

Immediate educational feedback

Role-based access control

Audit logging

The system promotes a learning-first security culture, aligning with modern organisational awareness training principles.


```bash
git clone <your-repo-url> phishing-portal
cd phishing-portal
