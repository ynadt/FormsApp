import prisma from '../prisma';

/**
 * Synchronizes the Supabase user with Prisma User table.
 * If the user does not exist, it is created with a default role ("USER").
 *
 * @param supabaseUser - an object containing at least { id: string; email?: string; name?: string }
 */
export async function syncUserRecord(supabaseUser: {
  id: string;
  email?: string;
  name?: string;
}): Promise<any> {
  const { id, email, name } = supabaseUser;
  let user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id,
        email: email ?? '',
        name: name ?? null,
        role: 'USER',
      },
    });
  }
  return user;
}
