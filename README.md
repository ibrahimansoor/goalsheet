# Goal Sheet Tracking App

A comprehensive goal sheet tracking application with automated coaching, LOA ratio calculations, and team management features.

## Features

### For Sales Reps
- Daily performance tracking (Contacts, Presentations, Credit Checks, Closes, Revenue)
- Automatic LOA ratio calculations (Contact-to-Presentation, Presentation-to-Credit, Close Rate)
- Real-time bottleneck identification
- 6996 Framework goal setting (5-Dimensional goals)
- Copy previous day's data
- Weekly goal tracking and reflections

### For Managers
- Team performance overview
- Individual rep coaching dashboards
- Trend analysis (week-over-week, month-over-month)
- Bottleneck identification across team
- PDF export functionality (alphabetically sorted)
- Bulk data management

### Automated Coaching
- Primary bottleneck detection hierarchy:
  1. Contact-to-Presentation ratio (target: 7:1)
  2. Presentation-to-Credit ratio (target: 2:1)
  3. Close rate (target: 80%)
- Specific actionable feedback based on performance
- Pattern recognition and improvement tracking

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Authentication**: JWT tokens
- **Charts**: Recharts
- **PDF Export**: jsPDF

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up PostgreSQL database:
   ```bash
   createdb goalsheet
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

5. Run database migrations:
   ```bash
   npm run db:migrate
   ```

6. (Optional) Seed with sample data:
   ```bash
   npm run db:seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Database Schema

- **users**: Employee profiles with roles and team assignments
- **daily_performance**: Daily numbers (contacts, presentations, closes, revenue)
- **weekly_goals**: Weekly targets and stretch goals
- **coaching_history**: Automated coaching feedback and tracking
- **six996_goals**: 6996 Framework goal planning

## LOA Ratios

- **Contact-to-Presentation**: Measures ability to set appointments (Target: 7:1)
- **Presentation-to-Credit**: Measures qualification skills (Target: 2:1)
- **Close Rate**: Measures closing ability (Target: 80%)

## Development

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend
- `npm run client` - Start only the frontend
- `npm run build` - Build for production

## License

MIT
