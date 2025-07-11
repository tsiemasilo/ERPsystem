# ERP Integration Platform

A full-stack ERP integration platform built with React, Express.js, and PostgreSQL using Neon Database.

## Features

- **Dashboard**: Comprehensive overview with KPIs, charts, and quick actions
- **Product Management**: Complete product catalog with inventory tracking
- **Order Processing**: Order management with status tracking
- **Customer Management**: Customer relationship management
- **Inventory Tracking**: Real-time inventory monitoring and alerts
- **ERP Integrations**: External system connections and sync management
- **Analytics**: Advanced reporting and data visualization

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon Database)
- **ORM**: Drizzle ORM
- **State Management**: TanStack React Query
- **Charts**: Chart.js
- **Routing**: Wouter

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Push database schema
npm run db:push
```

## Deployment

### Netlify Deployment

1. **Set up Neon Database**:
   - Create a Neon database project
   - Get your `DATABASE_URL` connection string

2. **Deploy to Netlify**:
   - Connect your GitHub repository to Netlify
   - Set environment variables:
     - `DATABASE_URL`: Your Neon database connection string
   - Deploy using the `netlify.toml` configuration

3. **Database Setup**:
   - Run `npm run db:push` to set up the database schema
   - The application includes comprehensive mock data for testing

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment (development/production)

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities
│   │   └── hooks/        # Custom hooks
├── server/               # Express backend
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── db.ts            # Database connection
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema
└── netlify/             # Netlify functions
    └── functions/
        └── api.js       # Serverless function
```

## Database Schema

- **Users**: Authentication and roles
- **Products**: Product catalog with SKUs and pricing
- **Customers**: Customer information and contacts
- **Orders**: Order processing with line items
- **Inventory**: Stock levels and reorder points
- **ERP Integrations**: External system configurations

## API Endpoints

- `GET /api/dashboard/*` - Dashboard metrics and charts
- `GET /api/products` - Product operations
- `GET /api/customers` - Customer management
- `GET /api/orders` - Order processing
- `GET /api/inventory` - Inventory tracking
- `GET /api/integrations` - ERP integrations

## License

MIT