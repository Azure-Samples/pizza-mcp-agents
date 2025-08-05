import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { DbService } from '../db-service';
import { ToppingCategory, type Topping } from '../topping';

function transformToppingImageUrl(topping: Topping, request: HttpRequest): Topping {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  return {
    ...topping,
    imageUrl: `${baseUrl}/api/images/${topping.imageUrl}`,
  };
}

app.http('toppings-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'toppings',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    context.log('Processing request to get toppings...');
    context.log('Request query:', request.query);

    const dataService = await DbService.getInstance();
    const categoryParam = request.query.get('category');

    // If a category is specified, filter toppings by category
    if (categoryParam && Object.values(ToppingCategory).includes(categoryParam as ToppingCategory)) {
      const toppings = await dataService.getToppingsByCategory(categoryParam as ToppingCategory);
      const transformedToppings = toppings.map((topping) => transformToppingImageUrl(topping, request));
      return {
        jsonBody: transformedToppings,
        status: 200,
      };
    }

    // Otherwise return all toppings
    const toppings = await dataService.getToppings();
    const transformedToppings = toppings.map((topping) => transformToppingImageUrl(topping, request));
    return {
      jsonBody: transformedToppings,
      status: 200,
    };
  },
});

app.http('topping-get-by-id', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'toppings/{id}',
  handler: async (request: HttpRequest, _context: InvocationContext) => {
    const id = request.params.id;
    const dataService = await DbService.getInstance();
    const topping = await dataService.getTopping(id);

    if (!topping) {
      return {
        jsonBody: { error: 'Topping not found' },
        status: 404,
      };
    }

    const transformedTopping = transformToppingImageUrl(topping, request);

    return {
      jsonBody: transformedTopping,
      status: 200,
    };
  },
});

app.http('topping-categories-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'toppings/categories',
  handler: async (_request: HttpRequest, _context: InvocationContext) => {
    return {
      jsonBody: Object.values(ToppingCategory),
      status: 200,
    };
  },
});
