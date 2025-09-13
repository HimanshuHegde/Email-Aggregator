import { PrismaClient, Prisma } from "../../generated/prisma";
import { encrypt } from "../crypto";

const prisma = new PrismaClient();

export async function createAccount(account: Prisma.AccountCreateManyInput[]) {
    for(const acc of account){
        if(acc.AppPass){
            const encryptedPass = encrypt(acc.AppPass as string);
            acc.AppPass = encryptedPass;
        }
    }
    await prisma.account.createMany({
        data: account
    });
}

export async function getAccountById(id: number) {
    return await prisma.account.findUnique({
        where: {
            id
        },
    });
}


export async function getAcountByOwnerId(ownerId: number) {
    return await prisma.account.findMany({
        where: {
            ownerId
        },
        include: { owner: true }
    });
}
export async function getMultipleAccountsByEmails(emails: string[]) {
    return await prisma.account.findMany({
        where: {
            email: {
                in: emails
            }
        },
        include: { owner: true }
    });
}
        
export async function getAccountByEmail(email: string) {
    return await prisma.account.findUnique({
        where: {
            email
        },
        include: { owner: true }
    });
}
export async function updateAccount(id: number, updates: Partial<Prisma.AccountUpdateInput>) {
    await prisma.account.update({
        where: { id },
        data: {
            ...updates
        }
    });
}
export async function deleteAccount(id: number) {
    await prisma.account.delete({
        where: { id }
    });
}



