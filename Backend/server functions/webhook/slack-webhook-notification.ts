// server functions to send slack notifications everytime a new email is indexed that is marked as interested
export async function slackWebhook(message: string) {
  let arrayOfUrls: string[] = [
    process.env.SLACK_WEBHOOK_URL!,
    process.env.WEBHOOK_SITE_URL!,
  ]; // contains the url of external webhook site and slack webhook url

  if (!arrayOfUrls.length) {
    console.log("No slack webhook url found");
    return;
  }
  //sends the notification to both the urls
  for (let url of arrayOfUrls) {
    try {
      if (!url) {
        console.log("No slack webhook url found");
        return;
      }
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: message }),
      });

      if (response.ok) {
        console.log("Slack notification sent successfully");
      } else {
        console.error("Failed to send Slack notification");
      }
    } catch (error) {
      console.error("Error sending Slack notification:", error);
    }
  }
}
