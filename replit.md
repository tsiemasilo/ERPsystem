# replit.md

## Overview

This is a full-stack ERP integration platform built specifically for Ace Online SA, featuring a React frontend with TypeScript, Express.js backend, and PostgreSQL database using Drizzle ORM. The application provides comprehensive business management functionality including product management, order processing, customer management, inventory tracking, and ERP system integrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with custom styling via shadcn/ui
- **Charts**: Chart.js for data visualization

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database with serverless connection pooling
- **API Structure**: RESTful endpoints organized by business domain

### Database Architecture
- **Primary Database**: PostgreSQL (via Neon Database)
- **Schema Management**: Drizzle migrations with schema-first approach
- **Connection**: Serverless connection pooling for scalability

## Key Components

### Core Business Entities
1. **Users**: Basic authentication and role management
2. **Products**: Product catalog with SKU, pricing, and categorization
3. **Customers**: Customer management with company details and contact information
4. **Orders**: Order processing with line items and status tracking
5. **Inventory**: Stock management with reorder points and quantity tracking
6. **ERP Integrations**: External system connections and sync status

### Frontend Pages
- **Dashboard**: KPI overview, charts, and quick actions
- **Products**: Product catalog management with CRUD operations
- **Orders**: Order processing and status management
- **Customers**: Customer relationship management
- **Inventory**: Stock level monitoring and alerts
- **Integrations**: ERP system configuration and sync management
- **Analytics**: Advanced reporting and data visualization

### UI Components
- **Layout**: Responsive sidebar navigation with header
- **Forms**: Validation-enabled forms using react-hook-form and Zod
- **Data Display**: Tables, cards, charts, and status badges
- **Interactive**: Modals, dropdowns, tooltips, and toast notifications

## Data Flow

1. **Client Requests**: React components use TanStack Query for API calls
2. **API Layer**: Express routes handle HTTP requests and validation
3. **Business Logic**: Storage layer abstracts database operations
4. **Database**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: JSON data flows back through the stack to update UI

### Key Data Patterns
- Server-side validation using Zod schemas
- Optimistic updates with query invalidation
- Real-time dashboard metrics and alerts
- Batch operations for inventory management

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with WebSocket support
- **drizzle-orm**: Type-safe database queries and migrations
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with validation
- **zod**: Runtime type validation
- **chart.js**: Data visualization and charting

### UI Dependencies
- **@radix-ui/***: Accessible UI primitive components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Modern icon library
- **wouter**: Lightweight client-side routing

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR for frontend
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Neon Database with environment-based configuration

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: esbuild bundling for Node.js deployment
- **Database**: Drizzle migrations for schema deployment

### Environment Configuration
- **DATABASE_URL**: Required for PostgreSQL connection
- **NODE_ENV**: Environment detection for build optimizations
- **REPL_ID**: Replit-specific development features

### Build Commands
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server execution
- `npm run db:push`: Database schema deployment

The application follows a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server code.