import { handleLeads } from '../src/server/apiHandlers';

export default async function handler(req: any, res: any) {
  return handleLeads(req, res);
}
