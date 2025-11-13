import { Options } from 'swagger-jsdoc';

export const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dog Explorer API',
      version: '1.0.0',
      description: 'Dog Explorer API - Express + TypeScript + MongoDB',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoint'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/app.ts'], // files containing OpenAPI definitions
};