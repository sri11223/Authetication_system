# Secure Authentication System - API Documentation

This directory contains the API documentation for the Secure Authentication System.

## 📚 Viewing the Documentation

The easiest way to view the documentation is via the interactive **Swagger UI** hosted by the application itself.

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Open your browser and navigate to:
   👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

There you can explore all endpoints, see request/response schemas, and even try out requests directly from the browser.

## 🛠️ API Structure

The API is organized into the following modules:

- **Authentication**: Registration, login, email verification, 2FA
- **Session Management**: View and revoke active sessions
- **Activity Monitoring**: Login stats, security scores, audit logs
- **Profile Management**: Profile updates, password changes

## 📁 Source Files

- **Swagger Config**: `server/src/config/swagger.js` - Main configuration and schema definitions
- **Route Docs**: `server/src/docs/*.yaml` - Individual endpoint documentation (OpenAPI 3.0 format)

## 🔐 Authentication Methods

The API supports two authentication methods (documented in Swagger):

1. **Bearer Token**: Send the JWT access token in the `Authorization` header.
   ```
   Authorization: Bearer <your_access_token>
   ```

2. **HTTP-Only Cookie**: The refresh token is automatically handled via secure cookies for token rotation.
