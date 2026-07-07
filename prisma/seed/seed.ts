import 'dotenv/config';
import * as encrypter from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {

  const organization = await prisma.organization.upsert({
    where: { slug: 'pawnvet-demo' },
    update: {},
    create: {
      name: 'PawnVet Clínica Demo',
      slug: 'pawnvet-demo',
    },
  });

  const profiles = await Promise.all([
    prisma.role.upsert({
      where: { slug: 'root' },
      update: {},
      create: {
        name: 'ROOT',
        description: 'Root profile with all permissions',
        slug: 'root',
      },
    }),
    prisma.role.upsert({
      where: { slug: 'admin' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrator profile with full access',
        slug: 'admin',
      },
    }),
    prisma.role.upsert({
      where: { slug: 'user' },
      update: {},
      create: {
        name: 'USER',
        description: 'User profile with limited access',
        slug: 'user',
      },
    }),
  ]);

  // Create default admin user
  const salt = encrypter.genSaltSync();
  const encryptedPassword = encrypter.hashSync('123456', salt);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pawnvet.dev' },
    update: {},
    create: {
      firstName: 'root',
      lastName: 'admin',
      email: 'admin@pawnvet.dev',
      organization: {
        connect: {
          slug: 'pawnvet-demo'
        }
      },
      password: encryptedPassword,
      role: {
        connect: {
          slug: 'root'
        }
      }
    },
  })

  console.log({ profiles, adminUser })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })