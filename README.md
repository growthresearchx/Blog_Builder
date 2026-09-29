# Blog Builder Platform — Full Stack Developer Hiring Assignment

A production-grade, internal blog publishing platform built for **Analyticsliv**, designed like an in-house version of Medium / Dev.to.

---

## 📌 Project Overview

The **Blog Builder Platform** is a full-stack web application designed for organization-wide knowledge sharing. It allows employees to draft and publish technical articles using a modern rich-text editor, enables administrators to moderate content and manage employee accounts, and provides a polished, public-facing portal for external readers to discover and interact with published blogs.

### Key Capabilities:
- **Admin Management:** Comprehensive dashboard with live analytics, employee directory management, platform-wide article moderation (edit/unpublish), and category/tag taxonomy controls.
- **Employee Blog Creation:** Intuitive Blog Builder powered by TipTap rich text, draft auto-saving, SEO slug generation, reading-time estimation, and Cloudinary media uploads.
- **Public Blog Platform:** Fast, accessible reader experience with Medium/Dev.to-inspired typography, category/tag filtering, keyword search, interactive likes, comments, and responsive layouts.
- **Role-Based Access Control (RBAC):** Server-side authentication and authorization using stateless JWT cookies and bcrypt password hashing.

---

## 🛠 Tech Stack & Architecture Reasoning

The selected tech stack adheres strictly to the hiring assignment specification:

| Layer | Technology | Architectural Reasoning |
|---|---|---|
| **Framework** | **Next.js 14 (App Router)** | Provides React Server Components (RSC) for fast public page rendering, built-in Route Handlers eliminating the need for a separate Express backend, and optimal SEO. |
| **Language** | **TypeScript** | Enforces strict end-to-end type safety across the entire application—from Prisma models and API schemas to React UI components. |
| **Styling** | **Tailwind CSS + Typography** | Utility-first CSS with `@tailwindcss/typography` ensuring accessible, highly readable article layouts with responsive prose styling. |
| **Database** | **PostgreSQL** | Robust relational database ensuring ACID compliance, strong referential integrity, and efficient querying via composite indexes and foreign-key constraints. |
| **ORM** | **Prisma ORM (5.22.0)** | Declarative schema modeling, automated migrations, type-safe database queries, and reliable relation handling (e.g. `onDelete: SetNull` for author post preservation). |
| **Authentication** | **JWT (`jose` / `jsonwebtoken`) + `bcryptjs`** | Secure, stateless authentication utilizing HTTP-only cookies and bcrypt password hashing for robust protection against XSS and credential leaks. |
| **Rich Text Editor** | **TipTap Editor** | Headless, modular editor supporting headings, bold, italic, bullet/ordered lists, code blocks, links, and inline images with zero DOM bloat. |
| **Media Storage** | **Cloudinary** | Cloud-based media storage with automatic image format optimization, CDN delivery, and responsive resizing. |
| **Validation** | **Zod** | Schema-based validation on all API endpoints and form inputs, preventing malformed or invalid database insertions. |
| **UI Utilities** | **Lucide React & Sonner** | Consistent iconography and non-blocking toast notifications for a polished user experience. |
| **Theming** | **next-themes** | Zero-flicker client-side dark and light mode toggle. |

---

## 🚀 Setup & Local Installation

### Prerequisites
- **Node.js:** v18.17+ or v20+
- **PostgreSQL:** Local instance (v14+) or hosted PostgreSQL database (e.g., Supabase / Neon)
- **Cloudinary Account:** (Optional for uploading new cover images, or use credentials in `.env`)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd "Analytics Liv"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file from the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your actual database and authentication credentials:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/blog_builder?schema=public"
   JWT_SECRET="your_super_secret_jwt_key_minimum_32_characters"
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

4. **Run Database Migrations & Seed Sample Data:**
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Production Build & Verification:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔑 Default Seed Credentials

After running `npm run prisma:seed`, the system is pre-configured with default accounts:

| Role | Email | Password | Panel Access |
|---|---|---|---|
| **Admin** | `admin@analyticsliv.com` | `Password@123` | `/admin/dashboard` |
| **Employee** | `employee@analyticsliv.com` | `Password@123` | `/employee/blogs` |

---

## 🔐 Environment Variables

| Variable | Description | Example / Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:1210@localhost:5432/blog_builder?schema=public` |
| `JWT_SECRET` | Secret key used to sign and verify JWT session tokens | `your_jwt_secret_key_change_in_production` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | `your_cloudinary_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API access key | `your_cloudinary_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API access secret | `your_cloudinary_api_secret` |
| `NEXT_PUBLIC_APP_URL` | Base application URL | `http://localhost:3000` |

---

## ✨ Features Implemented

### Core Features

#### 1. Authentication & Authorization
- **Public Signup:** Restricted exclusively to the `EMPLOYEE` role to prevent privilege escalation.
- **Login / Logout:** Stateless JWT authentication delivered via secure HTTP-only cookies.
- **Password Security:** Salted `bcryptjs` password hashing (passwords never stored in plain text).
- **Role-Based Access Control (RBAC):** Middleware and Route Handler protection for `ADMIN` vs `EMPLOYEE`.
- **Server-Side Ownership Protection:** Employees can only edit their own blog posts; Admins have moderation override.

#### 2. Employee Blog Builder
- **TipTap Rich-Text Editor:** Full formatting suite (Headings H1-H3, Bold, Italic, Bullet Lists, Numbered Lists, Code Blocks, Links, Images).
- **Cover Image Upload:** Integration with Cloudinary for fast CDN image hosting.
- **Category & Tag Selector:** Select from existing PostgreSQL categories and tags.
- **Draft & Publish Workflow:** Instant draft saving or one-click publishing.
- **SEO Slug Generation:** Automatic unique slug resolution from post titles with conflict avoidance.
- **Reading Time Estimation:** Real-time calculation based on word count.
- **Private Draft Preview:** Preview unpublished drafts without public exposure.

#### 3. Public Blog Platform
- **Clean Homepage (`/`):** Medium/Dev.to-inspired layout featuring published blogs.
- **Blog Cards:** Displays cover image, title, excerpt, author avatar, reading time, published date, category, and tags.
- **Individual Blog Detail (`/blogs/[slug]`):** High-readability article view with Tailwind Typography.
- **Search (`/search?q=...`):** Full-text search across titles, excerpts, and content for published posts.
- **Category Filtering (`/category/[slug]`):** Filter articles by category with active pill highlights.
- **Tag Filtering (`/tag/[slug]`):** Filter articles by associated tags.
- **Fully Responsive UI:** Optimized across Mobile, Tablet, and Desktop screen sizes.

#### 4. Admin Dashboard & Management
- **Dashboard Overview (`/admin/dashboard`):** Real-time KPI metrics for Total Blogs, Total Views, and Most Active Employee.
- **Employee Directory (`/admin/employees`):** List all employees with authored blog counts, add new employees, and non-destructively remove employees (preserving their published articles via `onDelete: SetNull`).
- **All Blogs Management (`/admin/blogs`):** Platform-wide content overview with Admin Edit override and Admin Unpublish actions.
- **Taxonomy CRUD (`/admin/categories` & `/admin/tags`):** Full Create, Read, Update, and Delete operations with safe cascade handling.

---

### 🎁 Bonus Features

| Bonus Feature | Status | Implementation Details |
|---|---|---|
| **Reading Time Estimate** | **Implemented** | Calculated automatically based on standard reading speed (wpm) and displayed on cards and article headers. |
| **Likes System** | **Implemented** | Interactive like/unlike toggle with PostgreSQL composite unique constraint (`postId, userId`) preventing duplicate likes. |
| **Comments System** | **Implemented** | Threaded discussions with user avatars, role badges, server validation, and author/Admin deletion. |
| **Pagination** | **Implemented** | Reusable pagination controls with previous/next and page number boundaries on Homepage, Search, Category, and Tag feeds. |
| **Dark Mode Toggle** | **Implemented** | Client-side theme switcher utilizing `next-themes` and Tailwind dark mode classes across all components and typography. |
| **Draft Auto-Save** | **Implemented** | Debounced auto-save hook preserving draft edits in the background with visual status feedback. |
| **Image Optimization** | **Implemented** | Next.js `<Image />` component paired with Cloudinary CDN optimization and responsive presets. |
| **Blog View Tracking** | **Implemented** | Atomic view count incrementation and `PostView` logging on published blog visits. |

---

## 🚫 Features Skipped

* **None.** All core features and all attempted bonus features specified in the hiring assignment PDF have been fully implemented, verified, and tested.

---

## ⚠️ Known Limitations

* **Image Upload Requirement:** Local image uploading requires valid Cloudinary credentials in `.env`. If Cloudinary credentials are not configured, existing image URLs and seeded Unsplash URLs continue to render smoothly.
* **No Unresolved Application Limitations:** All database relations, authentication boundaries, and responsive layouts function as expected without known defects.

---

## 📚 Seeded Sample Blogs

The database includes the exact 3 sample blogs specified in the hiring assignment PDF, pre-published and linked to their respective categories and tags:

1. **Blog 1 (Data & Analytics):**
   - **Title:** *The Future of Data Analytics: What Every Business Should Know in 2026*
   - **Slug:** `the-future-of-data-analytics-what-every-business-should-know-in-2026`
   - **Tags:** `#analytics`, `#business intelligence`, `#data trends`
   - **Reading Time:** 4 min read

2. **Blog 2 (Careers & Tech):**
   - **Title:** *Why Full-Stack Developers Are More Valuable Than Ever*
   - **Slug:** `why-full-stack-developers-are-more-valuable-than-ever`
   - **Tags:** `#full-stack development`, `#hiring`, `#software careers`
   - **Reading Time:** 5 min read

3. **Blog 3 (Productivity):**
   - **Title:** *5 Small Habits That Make You a Better Developer*
   - **Slug:** `5-small-habits-that-make-you-a-better-developer`
   - **Tags:** `#developer habits`, `#productivity`, `#coding tips`
   - **Reading Time:** 3 min read

---

## 🎥 Video Walkthrough

- **Walkthrough Video:** `[To be added before submission]`
- **Showcases:**
  1. Admin Login & Dashboard Analytics
  2. Employee Directory & Adding/Removing Employees
  3. Employee Login & Writing a Blog with TipTap & Cloudinary Upload
  4. Auto-save, Draft Preview, and Blog Publishing
  5. Public Homepage, Search, Category/Tag Filtering, Likes, and Comments
  6. Admin Unpublish & Moderation Override
  7. Dark Mode & Responsive Mobile/Desktop views

---

## 📦 Submission Deliverables

- **GitHub Repository:** `[To be added]`
- **Live Demo (Optional):** `[Optional — To be added]`

---

## 💡 What I Would Improve With More Time (3–5 Lines)

1. Implement Redis-based caching for high-traffic public blog routes and search queries to optimize response times.
2. Add full-text search indexing in PostgreSQL (`tsvector` / `pg_trgm`) for fuzzy keyword matching across millions of blog posts.
3. Add multi-author collaboration or draft revision history allowing rollback to previous edits.
4. Integrate Webhooks and social sharing metadata (OpenGraph cards) for automated sharing when an article is published.

---

## 📄 License

This project was developed as part of the Full Stack Developer Hiring Assignment for **Analyticsliv**. All rights reserved.
