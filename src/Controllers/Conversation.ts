import { Request, Response } from "express";
import users from "../Models/User";
import accounts from "../Models/Account";
import { idValidation } from "../Middlewares/FieldValidation";
import { Conversation } from "../Interfaces/Conversation";
import { State } from "../Interfaces/State";
import { getNextStates, initMessages } from "../Middlewares/Conversation";

// Función para crear relacion Usuer-Account
export const setConversationWith = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        if (!user || !account)
            return res.status(404).send(`Can´t find User or Account by Id`);

        const initState: State = account.conversationFlow.states.find(state => state.name == 'init')!;
        const conversation: Conversation = {
            account: account,
            currentState: initState,
            messages: initMessages(user, account), 
            nextStates: getNextStates(account.conversationFlow, initState)
        }

        user.conversations?.push(conversation);
        const savedUser = await user.save();
        return res.status(200).json(savedUser);
    } catch (error) {
        console.error(`Error (Controllerss/Conversation/setConversationWith)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
    }
}

// Obtener todas las conversaciones de un User
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

// Obtener la conversario entre User y Account
export const getConversation = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        if (!user || !account)
            return res.status(404).send(`Can´t find User or Account by Id`);

        const conversation = user.conversations?.find(conversation => conversation.account == account);
        if (!conversation)
            return res.status(404).send(`Can´t find conversation beetween the User and Account`);

        return res.status(200).json(conversation);
    } catch (error) {
        console.error(`Error (Controllers/Conversation/getConversation)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
    }
}

// Eliminar la conversación entre User y Account
export const drop = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        if (!user || !account)
            return res.status(404).send(`Can´t find User or Account by Id`);

        const indexConversation = user.conversations?.findIndex(conversation => conversation.account == account);
        if(indexConversation == -1)
            return res.status(404).send('Can´t find conversation beetween the User and Account');

        user.conversations?.splice(1, indexConversation);
        const savedUser = await user.save();
        return res.status(200).json(savedUser);
    } catch (error) {
        console.error(`Error (Controllers/Conversation/drop)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
    }
}