import { handleAnalyzeAi } from '../src/server/apiHandlers';

export default async function handler(req: any, res: any) {
  return handleAnalyzeAi(req, res);
}
