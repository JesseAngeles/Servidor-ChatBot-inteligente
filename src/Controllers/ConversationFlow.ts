import { Condition, State, Transition, ConversationFlow } from './../Interfaces/Account';
import { Request, Response } from 'express';
import accounts from "../Models/Account";

const defaultSelectString = "_id conversationFlow";

//Añadir condiciones, estados y transiciones
export const addConstraints = async (req: Request, res: Response) => {
    try {
        const idAccount:String = req.params.id;
        const conditions:[Condition] = req.body.conditions;
        const states:[State] = req.body.states;
        const transitions:[Transition] = req.body.transitions;

        if (!conditions && !states && !transitions)
            return res.status(400).send('Empty fields');

        const account = await accounts.findById(idAccount);
        if (!account) return res.status(404).send('Account not founds');

        console.log(account);

        //TODO Validacion de condiciones
        if (conditions && Array.isArray(conditions))
            account.conversationFlow.conditions.concat(conditions);
        
        //TODO Validacion de estados
        if (states && Array.isArray(states)) 
            account.conversationFlow.states.concat(states);

        //TODO Validación de transiciones
        if (transitions && Array.isArray(transitions))
            account.conversationFlow.transitions.concat(transitions);

        console.log(account);
        

        //const savedAccount = await account?.save();

        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/addConstriants): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}