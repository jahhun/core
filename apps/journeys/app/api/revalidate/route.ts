import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest): Promise<Response> {
  const searchParams = req.nextUrl.searchParams
  // Check for accessToken to confirm this is a valid request
  if (
    searchParams.get('accessToken') == null ||
    searchParams.get('accessToken') !==
      process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  ) {
    return Response.json({ message: 'Invalid access token' }, { status: 401 })
  }

  try {
    await revalidatePath(`/${searchParams.get('slug') as string}`)
    return Response.json({ revalidated: true })
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return Response.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
