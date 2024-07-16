import { Condition, State, Transition } from './../Interfaces/Account';
import { Request, Response } from 'express';
import accounts from "../Models/Account";

const defaultSelectString = "_id conversationFlow";

//TODO Obtener datos del flujo conversacional
export const addConstraints = async (req: Request, res: Response) => {
    try {
        const { idAccount } = req.params
        const { conditions, states, transitions } = req.body;
        if (!conditions && !states && !transitions)
            return res.status(400).send('Empty fields');


    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/addConstriants): ${error}`);
        return res.status(500).send(`Server error: ${error}`);

    }
}