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
  apis: [],
};

if (process.env.NODE_ENV === 'production'){
  swaggerOptions.apis = [
    ...swaggerOptions.apis,
    'dist/**/*.js'
  ]
} else {
  console.log("📝 Swagger Docs: Development mode detected, using TypeScript files for API documentation.");
  swaggerOptions.apis = [
    ...swaggerOptions.apis,
    'src/**/*.ts'
  ]
}

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default swaggerSpec;