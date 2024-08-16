import OpenAI from "openai";
import { Bayes } from "../Interfaces/Bayes";
import { ChatCompletionMessageParam } from "openai/resources";

require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function getResponse(messages: Array<ChatCompletionMessageParam>) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages
        })
        
        console.log(completion.choices[0].message);
    } catch (error) {
        console.error(`Error en Services/OpenAi/getResponse`);
        console.log(error);
    }
}