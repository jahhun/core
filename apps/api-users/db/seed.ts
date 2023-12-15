// version 1
// increment to trigger re-seed (ie: files other than seed.ts are changed)
import admin from 'firebase-admin'
import { v4 as uuidv4 } from 'uuid'

import { PrismaClient } from '.prisma/api-users-client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const testUser = {
    id: uuidv4(),
    userId: '12345678',
    firstName: 'playwright',
    lastName: 'user',
    email: 'testUser@example.com'
  }

  console.log('creating playwright user...')

  const createdUser = await prisma.user.create({
    data: testUser
  })

  console.log('user created!')
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
