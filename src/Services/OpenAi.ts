import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { Message } from "../Interfaces/Message";
import { bayesToString } from "../Middlewares/Bayes";
import { State } from "../Interfaces/State";

require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function generateResponse(messages: Message[], state: State): Promise<Message> {
    try {
        const chatMessages: Array<ChatCompletionMessageParam> = createChatCompletion(messages);
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: chatMessages
        })

        console.log(completion.choices[0].message);
        const answer: Message = {
            from: completion.choices[0].message.role,
            content: completion.choices[0].message.content!,
            feelings: null
        }

        return answer;
    } catch (error) {
        console.error(`Error (Services/OpenAi/generateResponse)`);
        console.log(error);
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

        console.log(completion.choices[0].message);
    } catch (error) {
        console.error(`Error en Services/OpenAi/getResponse`);
        console.log(error);
    }
}

function createChatCompletion(messages: Message[]): Array<ChatCompletionMessageParam> {
    const chatMessages: Array<ChatCompletionMessageParam> = new Array();

    messages.forEach(message => {
        const chatMessage = {
            "role": message.from,
            "content": message.content + bayesToString(message.feelings)
        }

        chatMessages.push(chatMessage);
    });

    return chatMessages;
}