import { Client } from "@elastic/elasticsearch";
import { classifyEmail } from "../server functions/aiClassifier";
import { Request, Response } from "express";
import { Email } from "../types/email";
const client = new Client({
  node: "http://localhost:9200",
  auth: { username: "elastic", password: process.env.ES_PASS! },
});

// function to index a single email document

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
  return res;
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
  const result = await client.update({
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

// export async function getAllEmails() {
//   const result = await client.search({
//     index: 'emails',
//     size: 1000, // number of emails to fetch (adjust as needed)
//     body: {
//       query: {
//         match_all: {}, // fetches all documents in the index
//       },
//     },
//   });

//   return result.hits.hits.map(hit => hit._source);
// }
