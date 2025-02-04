import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyIdToken } from 'next-firebase-auth'
import fetch from 'node-fetch'

import { initAuth } from '../../src/libs/firebaseClient/initAuth'

initAuth()

async function sleep(ms): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.cookies['journeys-admin.AuthUser'] == null)
    return res.status(400).json({ error: 'Missing Authorization header value' })

  if (
    process.env.JOURNEYS_URL == null ||
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN == null
  )
    return res.status(500).json({ error: 'Missing Environment Variables' })

  const token = req.cookies['journeys-admin.AuthUser']

  try {
    await verifyIdToken(token)
  } catch (e) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  const slug = req.query.slug?.toString()
  const hostname = req?.query?.hostname?.toString()

  if (slug == null) return res.status(400).json({ error: 'Missing Slug' })

  const params: { accessToken: string; slug: string; hostname?: string } = {
    accessToken: process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN,
    slug
  }

  if (hostname != null) params.hostname = hostname

  try {
    const response = await fetch(
      `${process.env.JOURNEYS_URL}/api/revalidate?${new URLSearchParams(
        params
      ).toString()}`
    )
    if (!response.ok)
      return res.status(response.status).json(await response.text())
  } catch (e) {
    return res.status(500).json({ error: 'Error revalidating' })
  }

  // 300ms required to invalidate edge caches
  await sleep(300)

  const proto = process.env.NODE_ENV === 'development' ? 'http://' : 'https://'

  res.redirect(
    307,
    `${
      hostname != null ? `${proto}${hostname}` : process.env.JOURNEYS_URL
    }/${slug}`
  )
}
