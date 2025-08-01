# Wheel of Life Assessment

## Overview

A web-based self-assessment tool that helps users evaluate balance in their lives through the "Wheel of Life" methodology. Users rate their satisfaction and motivation across 8 life categories (Health & Fitness, Friends & Family, Romance/Love Life, Personal Development, Fun & Recreation, Community & Contribution, Career/Business, and Finances), then receive a comprehensive analysis with visualizations and personalized insights. The application provides the option to email results for future reference.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: React Hook Form for form handling, TanStack Query for server state
- **Data Visualization**: Recharts for radar charts displaying assessment results
- **Styling**: Tailwind CSS with custom CSS variables for theming, Google Fonts (Playfair Display and Poppins)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with centralized route registration
- **Email Service**: Nodemailer for sending assessment results via SMTP
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development**: Hot reload with Vite integration for seamless development experience

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Assessment Data**: Temporary in-memory storage (no persistent assessment storage required)

### Authentication and Authorization
- **Current State**: Basic user schema defined but authentication not fully implemented
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development
- **Session Management**: Express sessions configured for PostgreSQL storage

### Form Validation and Type Safety
- **Schema Validation**: Zod for runtime type checking and validation
- **Shared Types**: Common schema definitions between client and server in shared directory
- **Form Handling**: React Hook Form with Zod resolver for client-side validation
- **API Validation**: Server-side validation using Zod schemas before processing

### Development and Build Process
- **Build System**: Vite for frontend, ESBuild for backend bundling
- **Development**: Concurrent development server with hot reload
- **TypeScript**: Strict type checking across frontend, backend, and shared code
- **Code Organization**: Monorepo structure with clear separation between client, server, and shared code

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack React Query
- **Routing**: Wouter for lightweight client-side routing
- **Build Tools**: Vite, TypeScript, ESBuild for production builds

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Playfair Display, Poppins) for typography
- **Animations**: Class Variance Authority for component variants

### Backend Services
- **Web Framework**: Express.js with CORS support
- **Database**: Drizzle ORM with PostgreSQL dialect, Neon Database serverless
- **Email Service**: Nodemailer for SMTP email delivery
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple

### Data Visualization
- **Charts**: Recharts for creating interactive radar charts of assessment results

### Development Tools
- **Type Safety**: Zod for schema validation and type inference
- **Development Experience**: Replit-specific plugins for enhanced development environment
- **Utilities**: date-fns for date manipulation, clsx and tailwind-merge for className management