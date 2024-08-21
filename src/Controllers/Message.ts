import { Request, Response } from "express";
import users from "../Models/User";
import accounts from "../Models/Account";
import { idValidation } from "../Middlewares/FieldValidation";
import { conversationExists } from "../Middlewares/Conversation";
import { Message } from "../Interfaces/Message";
import { testMessage } from "../Middlewares/Bayes";
import { generateResponse } from "../Services/OpenAi";

export const history = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount)
        const [exist, result] = conversationExists(user, account);
        if (!exist)
            return res.status(404).send(`${result}`);

        return res.status(200).json(result.messages);
    } catch (error) {
        console.error(`Error (Controllerss/Message/history)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}

export const newUserMessage = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;
        const content: string = req.body.message;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount)
        const [exist, result] = conversationExists(user, account);
        if (!exist)
            return res.status(404).send(`${result}`);

        //* Generar mensaje
        const message: Message = {
            from: "user",
            content: content,
            feelings: testMessage(content),
        }
        result.messages?.push(message);

        //* Genenerar respuesta
        const answer: Message = await generateResponse(result.messages!, result.currentState);
        if (answer.content == "Error")
            return res.status(500).send('Can´t process petition');

        result.messages?.push(answer);
        await user?.save();
        return res.status(200).json(answer);
    } catch (error) {
        console.error(`Error (Controllers/Message/newUserMessage)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}

export const newSystemMessage = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;
        const content: string = req.body.message;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount)
        const [exist, result] = conversationExists(user, account);
        if (!exist)
            return res.status(404).send(`${result}`);

        const message:Message = {
            from: "system",
            content: content,
            feelings: null,
        }

        return res.status(200).json(message);
    } catch (error) {
        console.error(`Error (Controllers/Message/newSystemMessage)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}