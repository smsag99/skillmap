# SkillMap — AI Career Coach

> From your CV to your dream job in 30 days.

SkillMap is a full-stack AI-powered career coaching app. Paste your CV, pick your dream job, and get a personalized 30-day learning roadmap — powered by Gemini AI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)
![Gemini](https://img.shields.io/badge/Gemini-AI-blue?style=flat-square&logo=google)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## Features

- **CV Analysis** — Upload your CV as PDF or paste as text. AI identifies your current skills, missing skills, and readiness score for your target role
- **CV Feedback** — Section-by-section rewrite suggestions tailored to your dream job
- **30-day Roadmap** — AI generates a personalized day-by-day learning plan targeting your specific skill gaps
- **Task Tracker** — Check off daily tasks and watch your progress bar grow
- **AI Daily Tips** — Expand any task to get a Gemini-powered coaching tip
- **Email Reminders** — Get daily nudges to stay on track via Resend
- **Public Sharing** — Share your roadmap with a public link
- **Auth** — Email/password and Google OAuth via Supabase
- **Mobile Responsive** — Works great on any device

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Google OAuth |
| AI | Google Gemini 2.5 Flash |
| Email | Resend |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account
- A [Google AI Studio](https://aistudio.google.com) API key
- A [Resend](https://resend.com) account (for email reminders)

### 1. Clone the repo

```bash
git clone https://github.com/smsag99/skillmap.git
cd skillmap
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Create a new Supabase project, then run this in the SQL Editor:

```sql
create table roadmaps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  goal text not null,
  cv_text text,
  skill_gaps jsonb,
  reminder_email text,
  reminder_enabled boolean default false,
  is_public boolean default false,
  created_at timestamp with time zone default now()
);

create table tasks (
  id uuid default gen_random_uuid() primary key,
  roadmap_id uuid references roadmaps(id) on delete cascade,
  day integer not null,
  title text not null,
  description text,
  done boolean default false,
  created_at timestamp with time zone default now()
);

alter table roadmaps enable row level security;
alter table tasks enable row level security;

create policy "Users see own roadmaps" on roadmaps
  for all using (auth.uid() = user_id);

create policy "Anyone can view public roadmaps" on roadmaps
  for select using (is_public = true);

create policy "Users see own tasks" on tasks
  for all using (
    roadmap_id in (
      select id from roadmaps where user_id = auth.uid()
    )
  );

create policy "Anyone can view tasks of public roadmaps" on tasks
  for select using (
    roadmap_id in (
      select id from roadmaps where is_public = true
    )
  );
```

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
skillmap/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Login
│   ├── signup/page.tsx           # Signup
│   ├── dashboard/page.tsx        # User dashboard
│   ├── new/page.tsx              # CV upload + analysis
│   ├── roadmap/[id]/page.tsx     # 30-day tracker
│   ├── auth/callback/route.ts    # OAuth callback
│   └── api/
│       ├── analyze/route.ts      # CV gap analysis
│       ├── roadmap/route.ts      # Roadmap generation
│       ├── tip/route.ts          # Daily AI tips
│       └── reminder/route.ts     # Email reminders
├── components/
│   ├── PageWrapper.tsx           # Page fade animation
│   └── Skeleton.tsx              # Loading skeleton
└── lib/
    ├── supabase.ts               # Supabase browser client
    ├── supabase-server.ts        # Supabase server client
    └── useIsMobile.ts            # Mobile detection hook
```

---

## Deployment

This app is deployed on Vercel. To deploy your own:

1. Push your code to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Add your Vercel URL to Supabase → Authentication → URL Configuration

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `RESEND_API_KEY` | Resend API key for emails |
| `NEXT_PUBLIC_APP_URL` | Your app URL (localhost or production) |

---

## Author

Built by **Mohammad Sheikh**

---

## License

MIT
