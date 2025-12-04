// import { Prisma, PrismaClient } from "@prisma/client";
import {prisma} from "../../lib/prisma"
import { Email } from "../../types/email";
import { getAccountByEmail, getMultipleAccountsByEmails } from "./accounts";
// const prisma = new PrismaClient();

export async function searchEmails(query: string) {
  try {
    let result = await prisma.$queryRaw<Email[]>`
  SELECT "id", "subject", "body","to", "from", "folder", "name", "aiLabel", "date", "accountId" ,"search_vector"::text AS "search_vector"
  FROM "Emails"
  WHERE "search_vector" @@ plainto_tsquery('english', ${query})
`;
    return result;
  } catch (err) {
    console.error("Error searching emails:", err);
    return [];
  }
}
export async function createEmailDB(email: any) {
  try {
    console.log("Creating email:", email);
    await prisma.emails.create({
      data: {
        ...email,
      },
    });
  } catch (err) {
    console.error("Error creating email:", err);
  }
}

export async function updateEmail(
  email: Partial<any> & { id: number }
) {
  try {
    await prisma.emails.update({
      where: { id: email.id },
      data: {
        ...email,
      },
    });
  } catch (err) {
    console.error("Error updating email:", err);
  }
}

export async function deleteEmail(id: number) {
  try {
    await prisma.emails.deleteMany({
      where: { accountId: id },
    });
  } catch (err) {
    console.error("Error deleting email:", err);
  }
}
export async function getEmailById(id: number) {
  try {
    return await prisma.emails.findUnique({
      where: {
        id,
      },
      include: { account: true },
    });
  } catch (err) {
    console.error("Error fetching email by ID:", err);
    return null;
  }
}

export async function createBulkEmails(
  emails: any[]
) {
  try {
    for(let email of emails){
      email.aiLabel = email.aiLabel ?? "Uncategorized";
    }
    await prisma.emails.createMany({
      data: emails,
      skipDuplicates: true,
    });
  } catch (err) {
    console.error("Error creating bulk emails:", err);
  }
}

export async function getEmailsByAccount(accounts: string[]) {
  try {
    let res = (await getMultipleAccountsByEmails(accounts)).map(
      (acc:any) => acc.id
    );
    return await prisma.emails.findMany({
      where: {
        accountId: {
          in: res,
        },
      },
      include: { account: true },
    });
  } catch (err) {
    console.error("Error fetching emails by account ID:", err);
    return null;
  }
}
export async function getLatestEmailByAccountId(accountId: number) {
  try {
    return await prisma.emails.findFirst({
      where: {
        accountId,
      },
      orderBy: {
        date: "desc",
      },
    });
  } catch (err) {
    console.error("Error fetching latest email by account ID:", err);
    return null;
  }
}

export async function getLast30DaysEmails(accoundId: number): Promise<Email[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    return await prisma.emails.findMany({
      where: {
        accountId: accoundId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  } catch (err) {
    console.error("Error fetching last 30 days emails:", err);
    return [];
  }
}
