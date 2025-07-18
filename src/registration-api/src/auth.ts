import { type HttpRequest } from '@azure/functions';

export function getUserInfo(request: HttpRequest) {
  try {
    const token = Buffer.from(request.headers.get('x-ms-client-principal') ?? '', 'base64').toString('ascii');
    return (token && JSON.parse(token)) || undefined;
  } catch (error) {
    return undefined;
  }
}
