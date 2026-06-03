import Fastify from 'fastify';
import cors from '@fastify/cors';
import dbPlugin from './plugins/db.js';
import requisitionRoutes from './routes/requisition-routes.js';
import purchaseOrderRoutes from './routes/purchase-order-routes.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: true,
  });

  app.register(dbPlugin);
  app.register(requisitionRoutes);
  app.register(purchaseOrderRoutes);

  // Swagger / OpenAPI
  app.register(swagger, {
    openapi: {
      info: {
        title: 'Procurement MVP API',
        description: 'API documentation for the procurement workshop',
        version: '1.0.0'
      }
    }
  });

  app.register(swaggerUi, {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformSpecification: (swaggerObject, request, reply) => swaggerObject,
    exposeRoute: true
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    if (reply.sent) {
      return;
    }

    reply.code(500).send({ message: 'Internal server error' });
  });

  return app;
}
