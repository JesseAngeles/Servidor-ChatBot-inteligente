import { Request, Response } from "express";
import users from "../Models/User";
import { idValidation } from "../Middlewares/FieldValidation";

export const getAll = async (req: Request, res: Response) => {
    try {
        const idUser: string = req.params.idUser;
        
        if (idValidation(idUser))
            return res.status(400).send(`Missing required fields`);

        const user = users.findById(idUser);
        if (!user)
            return res.status(404).send(`Can´t find user by Id`);

        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error (Controllers/Conversation/getAll)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
    }
}

export const setConversationWith = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        console.error(`Error (Controllers/Conversation/setConversationWith)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}

export const getConversation = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        console.error(`Error (Controllers/Conversation/getConversation)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
    }
}

export const drop = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        console.error(`Error (Controllers/Conversation/drop)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
    }
}