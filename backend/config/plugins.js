module.exports = ({ env }) => ({
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'API Documentation',
        description: 'API documentation for Strapi',
      },
      'x-strapi-config': {
        path: '/documentation',
      },
      servers: [
        { 
          url: `http://localhost:${env('PORT', 1337)}/api`, 
          description: 'Development server' 
        }
      ],
      security: [{ bearerAuth: [] }]
    }
  }
});