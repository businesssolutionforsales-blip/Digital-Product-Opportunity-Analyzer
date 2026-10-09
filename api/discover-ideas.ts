import { handleDiscoverIdeas } from '../src/server/apiHandlers';

export default async function handler(req: any, res: any) {
  return handleDiscoverIdeas(req, res);
}
