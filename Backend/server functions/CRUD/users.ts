import { PrismaClient,Prisma } from "../../generated/prisma";

const prisma = new PrismaClient();

export async function createUser(user: Prisma.UserCreateInput) {
    await prisma.user.create({
        data: {
            ...user
        }
    });
}
export async function getUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: {
            email
        }
    });
}  

export async function getUserById(id: number) {
    return await prisma.user.findUnique({
        where: {
            id
        }
    });
}
export async function updateUser(id: number, updates: Partial<Prisma.UserUpdateInput>) {
    await prisma.user.update({
        where: { id },
        data: {
            ...updates
        }
    });
}

export async function deleteUser(id: number) {
    await prisma.user.delete({
        where: { id }
    });
}
