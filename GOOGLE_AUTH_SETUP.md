# Google OAuth 2.0 Authentication Setup

This guide will help you set up Google OAuth 2.0 authentication for the manager login system.

## Prerequisites

1. A Google Cloud Platform account
2. Node.js and npm installed

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

### 2. Configure OAuth Consent Screen

1. In the Google Cloud Console, go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (or Internal if you're using Google Workspace)
3. Fill in the required fields:
   - App name: Your application name (e.g., "Boba Shop Manager")
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Add test users if using External type
6. Save and continue

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - Name: "Boba Shop Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Add your production domain when deploying
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Add your production domain when deploying
5. Click **Create**
6. Copy the **Client ID** (you'll need this)

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

### 5. Install Dependencies

```bash
npm install
```

This will install the required packages:
- `@react-oauth/google` - React Google OAuth integration
- `google-auth-library` - Server-side token verification

### 6. Start the Application

Start the development server:
```bash
npm run dev
```

Start the backend server:
```bash
npm run server:dev
```

### 7. Test the Authentication

1. Navigate to your application (default: `http://localhost:5173`)
2. Click the "Manager Mode" button in the top-right corner
3. You'll be redirected to the login page
4. Click "Sign in with Google"
5. Complete the Google authentication flow
6. You should be redirected to the Manager Dashboard

## Security Considerations

### Optional: Restrict to Specific Email Domains

To restrict access to only specific email domains (e.g., your company domain):

1. Open `server/routes/auth.ts`
2. Uncomment and modify the authorization check:

```typescript
const authorizedDomains = ['yourdomain.com', 'company.com'];
const emailDomain = payload.email?.split('@')[1];

if (!authorizedDomains.includes(emailDomain || '')) {
  return res.status(403).json({ error: 'Unauthorized domain' });
}
```

### Optional: Whitelist Specific Emails

To allow only specific email addresses:

```typescript
const authorizedEmails = ['manager@example.com', 'admin@example.com'];

if (!authorizedEmails.includes(payload.email || '')) {
  return res.status(403).json({ error: 'Unauthorized email' });
}
```

## File Structure

```
src/
├── components/
│   ├── ManagerLoginScreen.tsx    # Login page with Google sign-in
│   ├── ManagerHeader.tsx          # Header with user info and logout
│   └── ProtectedRoute.tsx         # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx            # Authentication state management
└── App.tsx                        # Main app with mode switching

server/
├── routes/
│   └── auth.ts                    # Authentication endpoints
└── index.ts                       # Express server setup
```

## API Endpoints

### POST `/api/auth/google`
Verifies Google OAuth token and returns user information.

**Request Body:**
```json
{
  "credential": "google-jwt-token"
}
```

**Response:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "email_verified": true
}
```

### GET `/api/auth/me`
Checks if the current token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://..."
}
```

### POST `/api/auth/logout`
Logs out the user (currently client-side only).

## Troubleshooting

### "Cannot find module '@react-oauth/google'"
Run `npm install` to install dependencies.

### "Invalid token" or "Authentication failed"
- Verify your Google Client ID is correct in `.env`
- Make sure both `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` are set
- Check that your domain is whitelisted in Google Cloud Console

### "Unauthorized domain" error
Add your current origin to the Authorized JavaScript origins in Google Cloud Console.

### Token expires too quickly
Google ID tokens typically expire after 1 hour. You can implement token refresh logic if needed.

## Production Deployment

When deploying to production:

1. Update `.env` with production Google Client ID (if different)
2. Add production domain to Google Cloud Console:
   - Authorized JavaScript origins
   - Authorized redirect URIs
3. Consider implementing:
   - Session management
   - Token refresh mechanism
   - Rate limiting
   - Audit logging

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [google-auth-library Documentation](https://www.npmjs.com/package/google-auth-library)
