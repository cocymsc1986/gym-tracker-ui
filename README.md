# Gym Tracker UI

A modern React Router 7 frontend application for tracking gym workouts and fitness progress.

## Features

- User registration and authentication
- Dashboard for workout tracking
- Responsive design with Tailwind CSS
- Form validation with React Hook Form
- Modern UI components with Radix UI

## Tech Stack

- **Framework**: React Router 7 with Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **TypeScript**: Full type safety

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API server running on localhost:8080

## Getting Started

1. Clone the repository:

```bash
git clone git@github.com:cocymsc1986/gym-tracker-ui.git
cd gym-tracker-ui
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:8080)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
app/
├── api/actions/        # API action handlers
├── components/ui/      # Reusable UI components
├── pages/             # Page components
├── routes/            # Route definitions
├── lib/               # Utility functions
└── root.tsx           # App root component
```

## Routes (In progress)

- `/` - Dashboard (requires authentication)
- `/login` - User login
- `/register` - User registration

## API Integration

The app integrates with a backend API for:

- User registration (`POST /auth/signup`)
- User authentication (`POST /auth/signin`)
- Token refresh functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.
