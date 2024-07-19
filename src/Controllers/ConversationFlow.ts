import { Condition, State, Transition, ConversationFlow } from './../Interfaces/ConversationFlow';
import { Request, Response } from 'express';
import accounts from "../Models/Account";
import { arraysEqual, conditionAsignation, stateAsignation } from './Validation';

const defaultSelectString = "_id conversationFlow";

// Añadir condiciones y estados
export const addConstraints = async (req: Request, res: Response) => {
    try {
        const id: String = req.params.id;
        const conditions: Condition[] = req.body.conditions;
        const states: State[] = req.body.states;

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
export const setTransition = async (req: Request, res: Response) => {
    try {
        const id: String = req.params.id;
        const idExit: String = req.body.exit;
        const idArrival: String = req.body.arrival;
        const conditions: [String, number][] = req.body.condition;

        const validConditions: [Condition, number][] = [];

        const account = await accounts.findById(id);
        if (!account) return res.status(404).send(`Can´t find account by ID`);

        if (!idExit || !idArrival)
            return res.status(400).send(`Incomplete information`);

        //* Validación de estados
        let flag: number = 0;
        account.conversationFlow.states.forEach(state => {
            if (idExit == state._id.toString()) flag++;
            if (idArrival == state._id.toString()) flag++;
        })

        if (flag !== 2) return res.status(400).send(`Can´t find state by ID`);

        const exitState = account.conversationFlow.states.find(state => state._id.toString() == idExit);
        const arrivalState = account.conversationFlow.states.find(state => state._id.toString() == idArrival);

        if (!exitState || !arrivalState) return res.status(400).send(`can't find exit or arrival state`);

        // * Validación de condiciones y valores
        conditions.forEach(condition => {
            const [conditionId, position] = condition;
            const currentCondition = account.conversationFlow.conditions.find(cond => cond._id.toString() === conditionId);

            if (currentCondition && position < currentCondition.values.length) {
                validConditions.push([currentCondition, position]);
            }
        });

        const transition: Transition = {
            exit: exitState,
            arrival: arrivalState,
            conditions: validConditions.length > 0 ? validConditions : null
        };

        // * Verificar si la transición ya existe
        const isDuplicate = account.conversationFlow.transitions.some(currentTransition => {
            return currentTransition.exit._id.toString() === transition.exit._id.toString() &&
                   currentTransition.arrival._id.toString() === transition.arrival._id.toString() &&
                   arraysEqual(currentTransition.conditions || [], transition.conditions || []);
        });

        if (isDuplicate) return res.status(400).send('Transition already exists');

        account.conversationFlow.transitions.push(transition);

        await account.save();
        return res.status(200).json(account.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/addTransitions): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Consultar condiciones y estados 
export const getConversation = async (req: Request, res: Response) => {
    try {
        const id: String = req.params.id;

        const account = await accounts.findById(id);
        if (!account) return res.status(404).send(`Can´t  find account by ID`);

        return res.status(200).json(account.conversationFlow);

    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/getConstraints): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}
