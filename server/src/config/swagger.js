const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Secure Authentication System API',
            version: '1.0.0',
            description: `
## Overview
A comprehensive authentication system built with the MERN stack featuring:
- JWT-based authentication with access & refresh tokens
- Email verification and password reset flows
- Two-factor authentication (2FA) with TOTP
- Multi-device session management
- Race-condition safe session handling
- Activity logging and security monitoring

## Authentication
Most endpoints require authentication via JWT. Include the access token in the Authorization header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

Alternatively, the system uses HTTP-only cookies for automatic token handling.

## Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- Password reset: 3 requests per hour
- General API: 100 requests per 15 minutes
      `,
            contact: {
                name: 'Srikrishna',
                email: 'srikrishna@example.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server',
            },
            {
                url: 'https://authetication-system.onrender.com/api',
                description: 'Production server (Render)',
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User registration, login, and token management',
            },
            {
                name: 'Password Management',
                description: 'Password reset and change operations',
            },
            {
                name: 'Two-Factor Auth',
                description: '2FA setup, verification, and management',
            },
            {
                name: 'Sessions',
                description: 'Device session management and revocation',
            },
            {
                name: 'Activity',
                description: 'Activity logs and security statistics',
            },
            {
                name: 'Profile',
                description: 'User profile management',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT access token',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'refreshToken',
                    description: 'HTTP-only cookie for refresh token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '60d5ec49f1b2c8b1a4c8e1a1' },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        isEmailVerified: { type: 'boolean', example: true },
                        twoFactorEnabled: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Session: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        deviceInfo: {
                            type: 'object',
                            properties: {
                                browser: { type: 'string', example: 'Chrome' },
                                browserVersion: { type: 'string', example: '120.0' },
                                os: { type: 'string', example: 'Windows 10' },
                                platform: { type: 'string', example: 'Microsoft Windows' },
                                device: { type: 'string', example: 'Desktop' },
                                ip: { type: 'string', example: '192.168.1.1' },
                            },
                        },
                        isCurrent: { type: 'boolean' },
                        lastActiveAt: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Activity: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        type: { type: 'string', example: 'login' },
                        description: { type: 'string', example: 'Logged in from Chrome on Windows' },
                        ip: { type: 'string', example: '192.168.1.1' },
                        userAgent: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        timeAgo: { type: 'string', example: '2h ago' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string' },
                                    message: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            example: {
                                success: false,
                                message: 'Authentication required',
                            },
                        },
                    },
                },
                ValidationError: {
                    description: 'Validation failed',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            example: {
                                success: false,
                                message: 'Validation error',
                                errors: [{ field: 'email', message: 'Invalid email format' }],
                            },
                        },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/docs/*.yaml', './src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
    // Swagger UI
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(specs, {
            customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
        .swagger-ui .info .title { color: #3b82f6 }
      `,
            customSiteTitle: 'Auth System API Documentation',
        })
    );

    // JSON endpoint for the spec
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};

module.exports = { setupSwagger, specs };
