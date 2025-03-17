# Compensate - Blockchain Payroll Services

A modern, high-performance Next.js application for blockchain-based payroll services.

## Features

- Fast, secure, and borderless payroll solutions
- Immutable, verifiable on-chain records
- Swift global, low-fee transfers
- Employee data control and management

## Performance Optimizations

This project has been optimized for performance in several ways:

- **Image Optimization**: Using Next.js Image component with proper sizing, formats (WebP/AVIF), and lazy loading
- **Code Splitting**: Dynamic imports for heavy components to reduce initial bundle size
- **Component Memoization**: React.memo for pure components to prevent unnecessary re-renders
- **Font Optimization**: Using `next/font` with proper display strategy and preloading
- **Lazy Loading**: Components below the fold are loaded with Suspense boundaries
- **CSS Optimization**: Experimental CSS optimization enabled in Next.js config

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router pages and layouts
  - `(landing)/`: Landing page components
  - `(employer)/`: Employer dashboard components
- `components/`: Reusable UI components
- `lib/`: Utility functions and shared code
- `public/`: Static assets

## Development Guidelines

- Use TypeScript for type safety
- Follow component-based architecture
- Optimize images and heavy components
- Use proper semantic HTML elements
- Ensure responsive design for all screen sizes

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deployment

The application can be deployed using Docker:

```bash
docker build -t compensate-client .
docker run -p 3000:3000 compensate-client
```
