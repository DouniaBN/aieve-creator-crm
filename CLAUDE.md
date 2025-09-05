# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Project Architecture

This is a React TypeScript Creator CRM application named "AIEVE" built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL database + authentication)
- **State Management**: React Context (dual contexts - AppContext for local state, SupabaseContext for database operations)
- **UI Components**: Custom components with Radix UI primitives, Lucide icons
- **Calendar**: react-big-calendar with moment.js
- **Drag & Drop**: @dnd-kit for sortable interfaces

### Key Architectural Patterns

**Dual Context Architecture**: 
- `AppContext` (`src/contexts/AppContext.tsx`) - manages local UI state, notifications, and demo data
- `SupabaseContext` (`src/contexts/SupabaseContext.tsx`) - handles database operations, authentication, and real-time data

**Main Application Structure**:
- `App.tsx` - Root component with navigation sidebar and tab-based routing
- Core sections: Dashboard, Projects, Brand Deals, Invoices, Settings
- Authentication handled via Supabase Auth with loading states

**Database Schema** (Supabase):
- `projects` - project management with status tracking
- `invoices` - invoice management with status workflow
- `brand_deals` - brand partnership tracking
- `content_posts` - content calendar posts across multiple platforms

**Component Organization**:
- Main feature components in `/components` (Projects.tsx, BrandDeals.tsx, etc.)
- Reusable UI components in `/components/ui`
- Each major feature has its own component with full CRUD operations

### Environment Configuration

Requires Supabase environment variables in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Database Migrations

Database schema managed via Supabase migrations in `/supabase/migrations/`