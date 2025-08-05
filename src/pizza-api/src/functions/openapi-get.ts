import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

// Env file is located in the root of the repository
dotenv.config({ path: path.join(process.cwd(), '../../.env'), quiet: true });

app.http('openapi-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'openapi',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    context.log('Processing request to get OpenAPI specification...');

    try {
      const openapiPath = path.join(process.cwd(), 'openapi.yaml');
      const openapiContent = await fs.readFile(openapiPath, 'utf8');

      // Replace PIZZA_API_HOST placeholder with actual host URL
      console.log('PIZZA_API_URL:', process.env.PIZZA_API_URL);
      context.log('Replacing <PIZZA_API_HOST> in OpenAPI specification...');
      const pizzaApiHost = process.env.PIZZA_API_URL || 'http://localhost:7071';
      const processedContent = openapiContent.replace('<PIZZA_API_HOST>', pizzaApiHost);

      const url = new URL(request.url);
      const wantsJson =
        url.searchParams.get('format')?.toLowerCase() === 'json' ||
        (request.headers.get('accept')?.toLowerCase().includes('json') ?? false);

      if (wantsJson) {
        try {
          const json = yaml.load(processedContent);
          return {
            jsonBody: json,
            headers: {
              'Content-Type': 'application/json',
            },
            status: 200,
          };
        } catch (error) {
          context.error('YAML to JSON conversion failed:', error);
          return {
            jsonBody: { error: 'YAML to JSON conversion failed.' },
            status: 500,
          };
        }
      }

      return {
        body: processedContent,
        headers: {
          'Content-Type': 'text/yaml',
        },
        status: 200,
      };
    } catch (error) {
      context.error('Error reading OpenAPI specification file:', error);

      return {
        jsonBody: { error: 'Error reading OpenAPI specification' },
        status: 500,
      };
    }
  },
});
