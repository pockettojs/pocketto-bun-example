import { swagger } from '@elysiajs/swagger';
import Elysia from 'elysia';

const Swagger = (app: Elysia) => {
    if (process.env.ENV !== 'development') {
        return app;
    }

    return app.use(swagger({
        provider: 'scalar',
        documentation: {
            info: {
                title: 'Pocketto Bun Example',
                version: '1.0.0',
                description: 'Pocketto Bun Example API Documentation',
            },
            // @ts-ignore
            securityDefinitions: {
                default: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            security: [{
                default: []
            }],
            tags: [
                {
                    name: 'Health',
                    description: 'Health related API',
                },
                {
                    name: 'Authentication',
                    description: 'Authentication related API',
                },
                {
                    name: 'User',
                    description: 'User related API',
                },
                {
                    name: 'Company',
                    description: 'Company related API',
                },
                {
                    name: 'Database',
                    description: 'Database related API',
                },
            ],
        },
        autoDarkMode: true,
        path: '/docs',
        exclude: [
            '/docs',
            '/docs/json',
        ],
    }));
};

export default Swagger;