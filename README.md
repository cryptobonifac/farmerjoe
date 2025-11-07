# Farmer Joe Web Application

A full-stack web application connecting local producers with customers for event-based farm sales.

## Project Overview

Farmer Joe is a platform that enables local producers to showcase their products through virtual stores and host on-spot sales events, while customers can discover nearby events, browse products, and make purchases directly.

## Features

- **Producer Registration Flow**: Multi-step registration with virtual store management
- **Customer Registration Flow**: Easy signup with preference configuration
- **Event Management**: Create and publish farm sale events with QR codes
- **Virtual Store**: Manage products with real-time stock updates
- **Event Discovery**: Search events by location, producer, or product category
- **Mobile QR Scanning**: On-spot sales with QR code integration
- **Subscription Model**: Tiered subscription plans via Stripe
- **User Preferences**: Favorite producers, products, and notification settings
- **Admin Dashboard**: User and subscription management
- **Push Notifications**: Real-time updates for events and orders

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Material-UI (MUI)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Payments**: Stripe
- **Notifications**: Firebase Cloud Messaging
- **Styling**: Emotion (MUI built-in)
- **Testing**: Jest, React Testing Library, Cypress
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe test account
- Firebase project

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/farmer-joe.git
   cd farmer-joe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Format code with Prettier
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Next.js pages and routes
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and helpers
├── types/           # TypeScript type definitions
├── styles/          # Global styles
└── services/        # API and external service integrations
```

## Development Workflow

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Make your changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Submit a pull request

## Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting

Run linting and formatting before committing:
```bash
npm run lint
npm run format
```

## Testing

Run tests with:
```bash
npm test
```

For integration tests (Cypress):
```bash
npm run cypress:open
```

## Deployment

### Staging
Push to the `staging` branch, which automatically deploys to Vercel preview.

### Production
Merge to `main` branch, which automatically deploys to production.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## Support

For issues and feature requests, please open an issue on GitHub.

## Authors

- Development Team

## Acknowledgments

- Material-UI for component library
- Next.js for framework
- Supabase for backend infrastructure