# Goal Sheet App - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd goalsheet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE goalsheet;
\q
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=goalsheet
DB_USER=postgres
DB_PASSWORD=your_actual_password

# JWT Configuration
JWT_SECRET=generate_a_random_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**Important**:
- Replace `DB_PASSWORD` with your PostgreSQL password
- Generate a secure random string for `JWT_SECRET` (e.g., use `openssl rand -base64 32`)

### 5. Run Database Migrations

Create the database schema:

```bash
npm run db:migrate
```

### 6. Seed Sample Data (Optional)

Add sample users and data for testing:

```bash
npm run db:seed
```

This creates:
- Manager account: `manager@example.com` / `password123`
- Rep accounts: `john.doe@example.com` / `password123`
- Sample daily performance data for the current week

### 7. Start the Application

Run both frontend and backend:

```bash
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 8. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Test Accounts

After seeding, you can login with:

**Manager Account:**
- Email: manager@example.com
- Password: password123

**Sales Rep Accounts:**
- Email: john.doe@example.com / Password: password123
- Email: jane.smith@example.com / Password: password123
- Email: mike.wilson@example.com / Password: password123

## Features Overview

### For Sales Reps
1. **Dashboard** - View weekly performance, charts, and coaching feedback
2. **Daily Entry** - Submit daily numbers with "Copy Previous Day" feature
3. **Weekly Goals** - Set target and stretch goals, weekly reflection
4. **6996 Goals** - 5-dimensional goal planning framework

### For Managers
1. **Team Dashboard** - Overview of all team members' performance
2. **Coaching Alerts** - See who needs help based on bottleneck analysis
3. **PDF Export** - Download alphabetically sorted team reports
4. **Date Selection** - View performance for any date

## Key Metrics

### LOA Ratios
- **Contact-to-Presentation**: Target 7:1 (7 contacts per 1 presentation)
- **Presentation-to-Credit**: Target 2:1 (2 presentations per 1 credit check)
- **Close Rate**: Target 80% (80% of credit checks should close)

### Automated Coaching
The system automatically identifies the primary bottleneck:
1. Low activity (< 60 contacts)
2. Poor contact-to-presentation ratio (> 7:1)
3. Poor presentation-to-credit ratio (> 2:1)
4. Low close rate (< 80%)

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env` file
- Ensure database exists: `psql -l`

### Port Already in Use
- Backend (3001): Change `PORT` in `.env`
- Frontend (5173): Change port in `vite.config.js`

### Migration Errors
- Drop and recreate database if needed:
  ```bash
  dropdb goalsheet
  createdb goalsheet
  npm run db:migrate
  ```

## Development

### Project Structure

```
goalsheet/
├── server/
│   ├── config/         # Database configuration
│   ├── database/       # Migrations and seeds
│   ├── middleware/     # Authentication middleware
│   ├── routes/         # API endpoints
│   ├── utils/          # Helper functions (LOA calculations, coaching)
│   └── index.js        # Express server
├── src/
│   ├── components/     # React components
│   ├── context/        # React context (Auth)
│   ├── pages/          # Page components
│   ├── utils/          # API calls and helpers
│   ├── App.jsx         # Main app component
│   └── main.jsx        # React entry point
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

#### Daily Performance
- `GET /api/daily-performance/user/:userId` - Get performance data
- `POST /api/daily-performance/user/:userId` - Submit daily numbers
- `GET /api/daily-performance/user/:userId/previous` - Get previous day
- `GET /api/daily-performance/team` - Get team performance (managers)

#### Weekly Goals
- `GET /api/weekly-goals/user/:userId` - Get weekly goals
- `POST /api/weekly-goals/user/:userId` - Save weekly goals

#### 6996 Goals
- `GET /api/six996-goals/user/:userId` - Get 6996 goals
- `POST /api/six996-goals/user/:userId` - Save 6996 goals

#### Coaching
- `GET /api/coaching/user/:userId` - Get coaching history
- `GET /api/coaching/user/:userId/today` - Get today's coaching
- `GET /api/coaching/team/overview` - Team coaching overview

## Production Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=strong-production-password
JWT_SECRET=strong-production-secret
CLIENT_URL=https://your-production-domain.com
```

### Serve Production Build

The backend can serve the static frontend:

```javascript
// Add to server/index.js
import path from 'path';
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check the API documentation
4. Open an issue in the repository

## License

MIT
