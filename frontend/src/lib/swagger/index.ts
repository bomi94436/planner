import { createSwaggerSpec } from 'next-swagger-doc'

import { schemas } from './schemas'

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Planner API Docs',
        version: '1.0',
      },
      components: {
        schemas,
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [],
    },
  })
  return spec
}
