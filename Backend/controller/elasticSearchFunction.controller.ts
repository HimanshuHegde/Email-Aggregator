import { Client } from "@elastic/elasticsearch";
import { Request, Response } from "express";
import { Email } from "../types/email";
import crypto from "crypto";

const client = new Client({
  node: 'https://my-elasticsearch-project-c4187a.es.us-central1.gcp.elastic.cloud:443',
  auth: {
    apiKey: 'eF8zMkFwa0J3d1lmeTdPSmQ4ODM6YXpTUGM0S3FCaU15UEdXRGtpX05qUQ=='
  },
});


// function to search emails based on a query string
export async function searchEmails(req: Request, res: Response) {
  const query = req.query.q as string;
  const result = await client.search({
    index: "emails",
    size: 50,
    body: {
      query: {
        multi_match: {
          query,
          fields: [
            "subject",
            "body",
            "from",
            "folder",
            "to",
            "account",
            "name",
          ],
          fuzziness: "AUTO",
        },
      },
    },
  });

  res
    .status(200)
    .json(result.hits.hits.map((hit) => ({ id: hit._id, ...hit._source! })));
}

// function to create emails
export async function createEmail(req: Request, res: Response) {
  const email: Email = req.body;
  email.folder = "[Gmail]/Sent Mail";
  email.account = email.from;
  const result = await client.index({
    index: "emails",
    body: email,
    refresh: true,
  });

  res.status(201).json({ id: result._id, ...email });
}

// function to get mail bys id
export async function getEmailById(req: Request, res: Response) {
  const { id } = req.params;
  const result = await client.get({
    index: "emails",
    id,
  });

  res.status(200).json({ id: result._id, ...result._source! });
}

// function to update email by id
export async function updateEmail(req: Request, res: Response) {
  const { id } = req.params;
  const updates: Partial<Email> = req.body;
  await client.update({
    index: "emails",
    id,
    body: {
      doc: updates,
    },
    refresh: true,
  });
  
  res.status(200).json({ id, ...updates });
}

// function to delete email by id
export async function deleteEmail(req: Request, res: Response) {
  const { id } = req.params;
  await client.delete({
    index: "emails",
    id,
    refresh: true,
  });

  res.status(200).json({ message: `Email with id ${id} deleted.` });
}

function generateId(email: Email): string {
  if (email.id) return email.id;
  return crypto
    .createHash("sha1")
    .update(`${email.subject}-${email.date}-${email.from}`)
    .digest("hex");
}

// function to bulk create emails
export async function BulkcreateEmail(emailList: Email[]) {
  try {
    

    if (Array.isArray(emailList)) {
      const bulkOps: any[] = [];

      for (const email of emailList) {
        email.folder = email.folder ?? "[Gmail]/All Mail";
        email.account = email.folder ==="Sent" ? email.from : email.to;

        const id = generateId(email);

        bulkOps.push({ create: { _index: "emails", _id: id } }); 
        bulkOps.push(email);
      }

      const result = await client.bulk({
        refresh: true,
        body: bulkOps,
      });

      
    } else {
      const email: Email = emailList;
      email.folder = email.folder ?? "[Gmail]/All Mail";
      email.account = email.from;

      const id = generateId(email);

      const result = await client.index({
        index: "emails",
        id,
        body: email,
        refresh: true,
        op_type: "create",
      });

    }
  } catch (err: any) {
    console.error("Error creating email(s):", err);
  }
}

