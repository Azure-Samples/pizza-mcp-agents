import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { DbService } from '../db-service';
import type { Pizza } from '../pizza';

function transformPizzaImageUrl(pizza: Pizza, request: HttpRequest): Pizza {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  return {
    ...pizza,
    imageUrl: `${baseUrl}/api/images/${pizza.imageUrl}`,
  };
}

app.http('pizzas-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'pizzas',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    context.log('Processing request to get all pizzas...');

    const dataService = await DbService.getInstance();
    const pizzas = await dataService.getPizzas();
    const transformedPizzas = pizzas.map((pizza) => transformPizzaImageUrl(pizza, request));

    return {
      jsonBody: transformedPizzas,
      status: 200,
    };
  },
});

app.http('pizza-get-by-id', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'pizzas/{id}',
  handler: async (request: HttpRequest, _context: InvocationContext) => {
    const id = request.params.id;
    const dataService = await DbService.getInstance();
    const pizza = await dataService.getPizza(id);

    if (!pizza) {
      return {
        jsonBody: { error: 'Pizza not found' },
        status: 404,
      };
    }

    const transformedPizza = transformPizzaImageUrl(pizza, request);

    return {
      jsonBody: transformedPizza,
      status: 200,
    };
  },
});
