# FootChamp - Sports Match Booking Platform

## Overview

FootChamp is a lead generation web application for booking football (soccer) matches in Toulouse and Marrakech. Users can submit their preferences for match scheduling including dates, time slots, match types (5v5, 7v7, 11v11), durations, and skill levels. The application captures leads through city-specific forms and stores them in a PostgreSQL database.

**Toulouse page features:**
- 23-hour countdown timer with localStorage persistence (resets when reaching zero)
- Simplified form with email optional and duration optional
- Conversion-focused messaging
- Upcoming games display with booking form (name, phone, number of persons)
- Prices shown in € (Euro)

**Marrakech page features:**
- Multilingual support (French, Arabic, English)
- Full form with email optional and duration optional
- Upcoming games display with WhatsApp booking integration (+212602424824)

**Admin Dashboard (route: /admin):**
- Login: zakaria_sacha / Tiznit
- City tabs to switch between Toulouse and Marrakech games
- Add/edit/delete games with venue, date, time, match type, price, status
- Manual reordering with up/down arrows (displayOrder field)
- Games stored with city field to filter by location

**Tournoi Ramadan page features (route: /tournoi-ramadan):**
- Bilingual support (French, Arabic)
- Tournament registration form for Ramadan tournament in Marrakech
- 8 teams, 2 groups, 7v7 format, 1400 Dhs per team
- Team size options: 7-10 players
- Emerald/purple gradient theme
- Accessed via landing page Marrakech dropdown modal

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: REST API with typed route definitions in `shared/routes.ts`
- **Validation**: Zod schemas shared between client and server for type-safe API contracts

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` contains table definitions for `leads_toulouse`, `leads_marrakech`, `tournament_registrations`, `page_visits`, `games_marrakech` (Marrakech game listings), `games_toulouse` (Toulouse game listings with duration field), and `joueur_toulouse` (player bookings for Toulouse games)
- **Migrations**: Drizzle Kit for database migrations (output to `./migrations`)

### Project Structure
```
client/           # React frontend application
  src/
    components/   # React components including shadcn/ui
    contexts/     # Language context for Marrakech
    hooks/        # Custom React hooks
    lib/          # Utility functions and query client
    pages/        # Page components (Home, Landing, NotFound)
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API route type definitions
```

### API Design
Routes are defined declaratively in `shared/routes.ts` with input/output Zod schemas. This enables:
- Type-safe API contracts shared between frontend and backend
- Automatic request validation on the server
- Consistent error response formats

Current endpoints:
- `POST /api/leads/toulouse` - Create lead for Toulouse
- `POST /api/leads/marrakech` - Create lead for Marrakech
- `POST /api/tournament/register` - Register for Ramadan tournament
- `POST /api/analytics/visit` - Track a page visit (accepts page and visitorId)
- `GET /api/stats/:page` - Get stats for a page (toulouse, marrakech, ramadan)

### Analytics System (Lightweight)
- Page visits tracked in `page_visits` table
- Each visit records: page name, anonymous visitor ID, timestamp
- No external analytics services - fully database-driven

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable

### UI/UX Libraries
- **Radix UI**: Accessible component primitives (dialog, popover, select, etc.)
- **Embla Carousel**: Carousel component
- **Vaul**: Drawer component
- **cmdk**: Command palette component
- **Lucide React**: Icon library

### Date/Time
- **date-fns**: Date manipulation and formatting with French locale support

### Development Tools
- **Vite**: Frontend build and dev server with HMR
- **Drizzle Kit**: Database schema management and migrations
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)
