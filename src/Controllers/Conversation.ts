import { Request, Response } from "express";

export const getAll = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        console.error(`Error (Controllers/Conversation/getAll)`);
        console.log(error);
        return res.status(500).send(`Internal server error`);
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