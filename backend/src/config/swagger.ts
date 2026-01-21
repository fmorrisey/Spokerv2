import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Spoker v2 API',
    version: '1.0.0',
  },
};

const swaggerOptions: { definition: typeof swaggerDefinition; apis: string[] } = {
  definition: swaggerDefinition,
  apis: ['docs/**/*.yaml'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app: Express) {
  console.log(
    '📝 Swagger Docs: Development mode detected, using TypeScript files for API documentation.'
  );
  
  // Disable CSP for swagger routes
  app.use('/api-docs', (req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    );
    next();
  });
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default swaggerSpec;