# Manager Authentication Setup Guide

## Overview
This setup implements a secure manager authentication system where only authorized email addresses stored in the database can access the manager dashboard via Google OAuth.

## Database Setup

### Option 1: Fresh Database Setup
If you're setting up a fresh database, run the main schema:
```bash
psql -h <your-db-host> -U <your-db-user> -d <your-db-name> -f server/schema.sql
```

### Option 2: Add to Existing Database
If you already have a database running, use the migration script:
```bash
psql -h <your-db-host> -U <your-db-user> -d <your-db-name> -f server/add_managers_table.sql
```

### Important: Set Your Admin Email
Before running the SQL scripts, edit the default admin email in:
- `server/schema.sql` (line with `INSERT INTO managers`)
- `server/add_managers_table.sql` (line with `INSERT INTO managers`)

Change `'admin@example.com'` to your actual Google account email.

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Build TypeScript
```bash
npm run build
```

### 3. Start the Server
```bash
npm start
```

The server should now be running with the new manager endpoints:
- `GET /api/managers` - Get all managers
- `GET /api/managers/check/:email` - Check if an email is authorized
- `POST /api/managers` - Add a new manager
- `DELETE /api/managers/:id` - Remove a manager

## Frontend Setup

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

## How It Works

### Authentication Flow
1. User clicks "Manager Mode" button
2. User is presented with Google Sign-In
3. Upon successful Google authentication:
   - The credential is sent to `/api/auth/google`
   - Backend verifies the token with Google
   - Backend checks if the email exists in the `managers` table
   - If authorized, user gains access to the manager dashboard
   - If not authorized, user sees an error message

### Adding New Managers
1. Existing managers can add new managers through the UI
2. In the Manager Dashboard, scroll to "User Management" section
3. Enter the email address of the new manager
4. Click "Add User"
5. The email is now authorized to access the manager dashboard

### Security Features
- Only emails in the database can sign in
- Cannot delete the last manager (prevents lockout)
- Email validation on both frontend and backend
- Duplicate email prevention
- Google OAuth token verification

## Testing

### Test the Authentication
1. Try logging in with an unauthorized email → Should see "Unauthorized" message
2. Add that email through the UI (if you have access)
3. Try logging in again → Should now work

### Test Manager Management
1. Log in as a manager
2. Add a new manager email
3. Verify it appears in the list
4. Try to remove a manager
5. Verify the last manager cannot be deleted

## Deployment Notes

### Environment Variables
Ensure these are set in your deployment environment:
```
GOOGLE_CLIENT_ID=your_google_client_id
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=5432
```

### Database Connection
The app uses SSL for database connections (required for AWS RDS and similar services).

### API Endpoints
Make sure your frontend can reach the backend API:
- Development: `http://localhost:3001/api`
- Production: Set `VITE_API_URL` environment variable

## Troubleshooting

### "Cannot connect to database"
- Check your database credentials in `.env`
- Verify the database is running
- Check network/firewall settings

### "Unauthorized domain" error
- Verify the email is in the managers table
- Check backend logs for detailed error messages
- Run: `SELECT * FROM managers;` to see all authorized emails

### Google OAuth not working
- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Check Google Cloud Console OAuth settings
- Ensure authorized redirect URIs are configured

### Manager list not loading
- Check browser console for errors
- Verify API endpoint is accessible
- Check CORS settings in `server/index.ts`

## Database Schema

```sql
CREATE TABLE managers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Reference

### GET /api/managers
Returns all managers in the system.

Response:
```json
[
  {
    "id": 1,
    "email": "manager@example.com",
    "created_at": "2025-12-04T00:00:00.000Z"
  }
]
```

### POST /api/managers
Add a new manager.

Request:
```json
{
  "email": "newmanager@example.com"
}
```

Response:
```json
{
  "id": 2,
  "email": "newmanager@example.com",
  "created_at": "2025-12-04T00:00:00.000Z"
}
```

### DELETE /api/managers/:id
Remove a manager (cannot delete the last manager).

Response:
```json
{
  "message": "Manager deleted successfully",
  "email": "manager@example.com"
}
```

### POST /api/auth/google
Verify Google OAuth token and check manager authorization.

Request:
```json
{
  "credential": "google_oauth_token"
}
```

Response (Success):
```json
{
  "email": "manager@example.com",
  "name": "Manager Name",
  "picture": "https://...",
  "email_verified": true,
  "isManager": true
}
```

Response (Unauthorized):
```json
{
  "error": "Unauthorized",
  "message": "Your email is not authorized to access the manager dashboard."
}
```
