import { Request, Response } from "express";
import users from "../Models/User";
import accounts from "../Models/Account";
import { idValidation } from "../Middlewares/FieldValidation";
import { Conversation } from "../Interfaces/Conversation";
import { conversationExists, initConversation } from "../Middlewares/Conversation";

// Function to create the conversation User-Account
export const setConversationWith = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;
        const { theyKnown } = req.body || false;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        if (!user || !account)
            return res.status(404).send(`Can´t find User or Account by Id`);

        const [exists,] = conversationExists(user, account);
        if (exists)
            return res.status(400).send(`Conversation already exists`);

        const conversation: Conversation = await initConversation(user, account, theyKnown);
        user.conversations?.push(conversation);
        await user.save();
        return res.status(200).json(conversation);
    } catch (error) {
        console.error(`Error (Controllers/Conversation/setConversationWith)`, error);
        return res.status(500).send(`Internal server error`);
    }
}

// get all the user conversations
export const getAll = async (req: Request, res: Response) => {
    try {
        const idUser: string = req.params.idUser;

        if (!idValidation(idUser))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        if (!user)
            return res.status(404).send(`Can´t find user by Id`);

        return res.status(200).json(user.conversations);
    } catch (error) {
        console.error(`Error (Controllers/Conversation/getAll)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
    }
}

// Get the conversation between User and Account
export const getConversation = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        const [exist, result] = conversationExists(user, account);
        if (!exist)
            return res.status(404).send(`${result}`);

        return res.status(200).json(result);
    } catch (error) {
        console.error(`Error (Controllers/Conversation/getConversation)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
    }
}

// Delete the conversation between user and Account
export const drop = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        const [exists, result] = conversationExists(user, account);
        if (!exists)
            return res.status(404).send(`${result}`);

        const indexConversation = user!.conversations?.findIndex(conversation => conversation.account._id.toString() === account!._id.toString());
        if (indexConversation == -1)
            return res.status(404).send('Can´t find conversation beetween the User and Account');

        user!.conversations?.splice(indexConversation!, 1);
        const savedUser = await user!.save();
        return res.status(200).json(result);
    } catch (error) {
        console.error(`Error (Controllers/Conversation/drop)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
    }
}