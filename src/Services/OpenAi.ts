import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { Message } from "../Interfaces/Message";
import { bayesToString } from "../Middlewares/objectToString";

require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function generateResponse(messages: Message[]): Promise<Message> {
    try {
        const chatMessages: Array<ChatCompletionMessageParam> = createChatCompletion(messages);
        chatMessages.push({role: "system", content: "Follow the conversation"})
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: chatMessages
        })

        const answer: Message = {
            from: completion.choices[0].message.role,
            content: completion.choices[0].message.content!,
            feelings: null
        }

        return answer;
    } catch (error) {
        console.error(`Error (Services/OpenAi/generateResponse)`, error);
        return {
            from: "system",
            content: "Error",
            feelings: null,
        };
    }
}

export async function getResponse(messages: Array<ChatCompletionMessageParam>) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages
        })
    } catch (error) {
        console.error(`Error en Services/OpenAi/getResponse`, error);
    }
}

function createChatCompletion(messages: Message[]): Array<ChatCompletionMessageParam> {
    const chatMessages: Array<ChatCompletionMessageParam> = new Array();

    messages.forEach(message => {
        const chatMessage = {
            "role": message.from,
            "content": message.content + bayesToString(message.feelings!)
        }

        chatMessages.push(chatMessage);
    });

    return chatMessages;
}