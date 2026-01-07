# Phishing Simulation & Awareness Portal

## 1. Overview

This project is a **web-based phishing simulation and awareness portal** designed to let staff or students safely experience phishing emails and learn how to recognise them. The platform is designed for educational use and is operated in a controlled environment, aimed to improve cybersecurity awareness, whilst avoiding real user security risks.

The system allows an administrator or instructor to:

- Create and schedule phishing campaigns.
- Send templated phishing emails with personalised variables.
- Track when emails are **opened, clicked, or reported**.
- Show a **landing page** explaining why the email was suspicious.
- View a **dashboard** with core metrics (open, click, report rates).

> **Note:** The original brief suggested PostgreSQL. For simplicity and to align with my current skills, this implementation uses **MySQL (via XAMPP + phpMyAdmin)** instead. This choice is explained in the Technology Stack section.

---

## 2. Features vs Coursework Requirements

### Core Features (Must-Have)

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

---

### Security Requirements

-  **Role-Based Access Control (RBAC)**  
  Roles:
  - **Admin** – full control: manage users, campaigns, launch/delete campaigns.
  - **Instructor** – create and launch campaigns, view analytics.
  - **Viewer** – read-only access to dashboards and campaign lists.

-  **Input sanitisation**  
  - `express-validator` used on backend routes to validate and sanitise inputs.
  - Dangerous characters are stripped or escaped before being stored or rendered.

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

---

## 4. Prerequisites

- Node.js (LTS)
- npm
- XAMPP (Apache + MySQL + phpMyAdmin)
- Git (optional, for version control)
- MailHog (optional, for realistic email testing)

---

## 5. Installation & Setup

### Step 1 – Clone / Download the Project

```bash
git clone <your-repo-url> phishing-portal
cd phishing-portal
