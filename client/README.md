# Spinzone Laundry - Client

React (Vite) frontend for the Spinzone Laundry Shop Management System.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Structure

```
client/
├── src/
│   ├── api/           # API handlers and axios config
│   ├── assets/        # Static assets (images, icons)
│   ├── components/    # React components
│   │   ├── auth/      # Authentication components
│   │   ├── customer/  # Customer portal components
│   │   ├── layout/    # Layout components
│   │   ├── staff/     # Staff dashboard components
│   │   └── ui/        # Reusable UI components
│   ├── contexts/      # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── interfaces/    # TypeScript interfaces (re-exports)
│   ├── pages/         # Page components
│   ├── routes/        # Routing configuration
│   ├── services/      # API service layer
│   ├── types/         # TypeScript type definitions
│   └── util/          # Utility functions
└── public/            # Static public assets
```
