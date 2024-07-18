import { Condition, State, Transition, ConversationFlow } from './../Interfaces/Account';
import { Request, Response } from 'express';
import accounts from "../Models/Account";
import { conditionAsignation, stateAsignation } from './Validation';

const defaultSelectString = "_id conversationFlow";

// Añadir condiciones y estados
export const addConstraints = async (req: Request, res: Response) => {
    try {
        const id: String = req.params.id;
        const conditions:Condition[] = req.body.conditions;
        const states:State[] = req.body.states;

        const account = await accounts.findById(id);
        if (!account) return res.status(404).send(`Can´t found account by ID`);

        if (conditions && Array.isArray(conditions)) 
            conditionAsignation(account.conversationFlow.conditions, conditions);
        
        if (states && Array.isArray(states))
            stateAsignation(account.conversationFlow.states, states);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/addConstraints): ${error}`);
        return res.status(500).send(`Server error: ${error}`);   
    }
}

//TODO Añadir transiciones
export const setTransitions = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/addTransitions): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Consultar condiciones y estados 
export const getConversation = async (req: Request, res: Response) => {
    try {
        const id:String = req.params.id;

        const account = await accounts.findById(id);
        if (!account) return res.status(404).send(`Can´t  find account by ID`);

        return res.status(200).json(account.conversationFlow);

    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/getConstraints): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}
