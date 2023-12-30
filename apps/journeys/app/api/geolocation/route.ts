export async function GET(req: Request): Promise<Response> {
  return Response.json({
    country: req.headers['x-vercel-ip-country'],
    region: req.headers['x-vercel-ip-country-region'],
    city: req.headers['x-vercel-ip-city']
  })
}
