import {GoogleGenerativeAI} from "@google/generative-ai";;


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function classifyEmail(subject: string, body: string): Promise<string> {
    const prompt = `
        You are an email classifier. Your task is to analyze the following email and categorize it into one of these labels:
        - Interested
        - Meeting Booked
        - Not Interested
        - Spam
        - Out of Office

        You must only return the label and nothing else.

        Email Subject: ${subject}
        Email Body: ${body}
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        const label = text.trim();
        return label || 'Unclassified';

    } catch (error) {
        console.error(`error in classification: ${error}`);
        return 'Unclassified';
    }
}