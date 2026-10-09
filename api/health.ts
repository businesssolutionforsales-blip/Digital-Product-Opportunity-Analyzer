import { handleHealth } from '../src/server/apiHandlers';

export default async function handler(req: any, res: any) {
  return handleHealth(req, res);
}
