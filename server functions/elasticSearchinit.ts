import { Client } from "@elastic/elasticsearch";
import { Email } from "../types/email";
import { classifyEmail } from "./aiClassifier";
import {slackWebhook } from "./webhook/slack-webhook-notification";
const client = new Client({
  node: "http://localhost:9200",
  auth: { username: "elastic", password: process.env.ES_PASS! },
});

export async function createEmailIndex() {
  try {
    // check if the index already exists
    const exists = await client.indices.exists({ index: "emails" });

    if (!exists) {
      // create the index with mappings
      const body = await client.indices.create({
        index: "emails",
        mappings: {
          properties: {
            account: { type: "keyword" },
            folder: { type: "keyword" },
            aiLabel: { type: "keyword" },
            from: { type: "text" },
            to: { type: "text" },
            subject: { type: "text" },
            body: { type: "text" },
            date: { type: "date" },
          },
        },
      });
      console.log("index created successfully:", body);
    } else {
      console.log("index already exists");
    }
  } catch (err) {
    console.error("Error creating index:", err);
  }
}

export async function indexingEmail(email: Email) {
  try {
    email["aiLabel"] = await classifyEmail(email.subject, email.body || "");

    // if the email is marked as interested, send a slack-webhook-notification
    if (email.aiLabel == "Interested") {
      await slackWebhook(
        `New Interested Email from ${email.from} with subject: ${email.subject}`
      );
    }
    const response = await client.index({
      index: "emails",
      document: email,
      refresh: true,
    });
    console.log("email created", response._id);
  } catch (err) {
    console.error("error indexing email:", err);
  }
}
