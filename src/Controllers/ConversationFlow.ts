import { Condition, State, Transition, ConversationFlow } from './../Interfaces/ConversationFlow';
import { Request, Response } from 'express';
import accounts from "../Models/Account";
import { arraysEqual, conditionAsignation, stateAsignation } from './Validation';
import mongoose from 'mongoose';

// Añadir condiciones y estados
export const addConstraints = async (req: Request, res: Response) => {
    try {
        const idAccount: String = req.params.idAccount;
        const { conditions, states }: { conditions: Condition[], states: State[] } = req.body;

        const account = await accounts.findById(idAccount);
        if (!account) //* la cuenta existe en la base de datos
            return res.status(404).send(`Can´t find account by ID`);

        if (conditions && Array.isArray(conditions)) //* conditions es un arreglo
            conditionAsignation(account.conversationFlow.conditions, conditions);

        if (states && Array.isArray(states)) //* states es un arreglo
            stateAsignation(account.conversationFlow.states, states);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/addConstraints): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Añadir transiciones
export const setTransition = async (req: Request, res: Response) => {
    try {
        const idAccount: String = req.params.idAccount;
        const conditions: [Condition, number][][] = req.body.conditions;
        const { idExit, idArrival } = req.body;

        let flagState: number = 0;

        const validConditions: [Condition, number][][] = [[]];

        const account = await accounts.findById(idAccount);
        if (!account) //* la cuenta existe en la base de datos
            return res.status(404).send(`Can´t find account by ID`);

        if (!idExit || !idArrival)  //*Exit o Arrival no estan asignados
            return res.status(400).send(`Incomplete information`);

        //* Validación de estados
        account.conversationFlow.states.forEach(state => {
            if (idExit == state._id.toString()) flagState++;
            if (idArrival == state._id.toString()) flagState++;
        })

        if (flagState !== 2) return res.status(400).send(`Can´t find state by ID`);

        const exitState = account.conversationFlow.states.find(state => state._id.toString() == idExit);
        const arrivalState = account.conversationFlow.states.find(state => state._id.toString() == idArrival);

        if (!exitState || !arrivalState) return res.status(400).send(`can't find exit or arrival state`);

        // * Validación de condiciones y valores
        conditions.forEach(orConditions => {
            const validOrConditions: [Condition, number][] = [];
            orConditions.forEach(condition => {
                const [conditionId, position] = condition;
                const currentCondition = account.conversationFlow.conditions.find(cond => cond._id.toString() === conditionId);

                if (currentCondition && position < currentCondition.values.length)
                    validOrConditions.push([currentCondition, position]);
            })
            if (validConditions.length > 0)
                validConditions.push(validOrConditions);
        });
        (validConditions.reverse().pop())?.reverse();

        const transition: Transition = {
            _id: new mongoose.Types.ObjectId(),
            exit: exitState,
            arrival: arrivalState,
            conditions: validConditions.length > 0 ? validConditions : null,
        };
        // * Verificar si la transición ya existe
        const isDuplicate = account.conversationFlow.transitions.some(currentTransition => {
            return currentTransition.exit._id.toString() === transition.exit._id.toString() &&
                currentTransition.arrival._id.toString() === transition.arrival._id.toString()
        });
        if (isDuplicate) //* Evita transiciones deuplicadas
            return res.status(400).send('Transition already exists');

        account.conversationFlow.transitions.push(transition);
        await account.save();
        return res.status(200).json(account.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/addTransitions): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Consultar flujo conversacional 
export const getConversation = async (req: Request, res: Response) => {
    try {
        const id: String = req.params.id;

        const account = await accounts.findById(id);
        if (!account) return res.status(404).send(`Can´t  find account by ID`);

        return res.status(200).json(account.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/getConversation): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Actualizar condiciones
export const updateCondition = async (req: Request, res: Response) => {
    try {
        const idAccount = req.params.idAccount;
        const idCondition = req.params.idCondition;

        const name = req.body.name;
        const values: any[] = req.body.values;

        let nameUnique = true;
        let conditionExist = false;
        let indexCondition: number = 0;

        if (!idAccount || !idCondition || !name) return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);

        if (!account) return res.status(404).send('Can´t find account by ID')

        for (const condition of account.conversationFlow.conditions) {
            if (condition._id.toString() === idCondition) {
                conditionExist = true;
                indexCondition = account.conversationFlow.conditions.findIndex(cond => cond._id.toString() === condition._id.toString());
            } else if (condition.name === name) {
                nameUnique = false;
                break;
            }
        }

        if (!conditionExist || !nameUnique) return res.status(400).send('Can´t update condition');

        account.conversationFlow.conditions[indexCondition].name = name;
        if (values && Array.isArray(values))
            account.conversationFlow.conditions[indexCondition].values = values;

        const updatedCondition = await account.save();
        return res.status(200).json(updatedCondition.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/updateCondition): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Actualizar Estados
export const updateState = async (req: Request, res: Response) => {
    try {
        const idAccount = req.params.idAccount;
        const idState = req.params.idState;

        const name = req.body.name;
        const description = req.body.description;

        let nameUnique = true;
        let stateExist = false;
        let indexState: number = 0;

        if (!idAccount || !idState || !name) return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);

        if (!account) return res.status(404).send('Can´t find account by ID')

        for (const state of account.conversationFlow.states) {
            if (state._id.toString() === idState) {
                stateExist = true;
                indexState = account.conversationFlow.states.findIndex(stat => stat._id.toString() === state._id.toString());
            } else if (state.name === name) {
                nameUnique = false;
                break;
            }
        }

        if (!stateExist || !nameUnique) return res.status(400).send('Can´t update state');

        account.conversationFlow.states[indexState].name = name;
        if (description) account.conversationFlow.states[indexState].description = description;

        const updatedState = await account.save();
        return res.status(200).json(updatedState.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/updateState): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Eliminar condiciones
export const deleteCondition = async (req: Request, res: Response) => {
    try {
        const idAccount = req.params.idAccount;
        const idCondition = req.params.idCondition;

        let conditionExist: boolean = false;
        let conditionInUse: boolean = false;
        let conditionIndex: number = 0;

        if (!idAccount || !idCondition) return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);
        if (!account) return res.status(404).send(`Can´t find account by ID`);

        for (const condition of account.conversationFlow.conditions) {
            if (condition._id.toString() == idCondition) {
                conditionExist = true;
                break;
            }
            conditionIndex++;
        }

        if (!conditionExist) return res.status(404).send(`Can´t find condition by ID`);

        for (const transition of account.conversationFlow.transitions) {
            if (!transition.conditions) continue;
            for (const orCondition of transition.conditions)
                for (const condition of orCondition)
                    if (condition[0]._id.toString() == idCondition) {
                        conditionInUse = true;
                        break;
                    }
        }

        if (conditionInUse) return res.status(400).send(`Can´t delete, condition in use`);
        account.conversationFlow.conditions.splice(conditionIndex, 1);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteCondition): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Eliminar estados
export const deleteState = async (req: Request, res: Response) => {
    try {
        const idAccount = req.params.idAccount;
        const idState = req.params.idState;

        let stateExist: boolean = false;
        let stateInUse: boolean = false;
        let stateIndex: number = 0;

        if (!idAccount || !idState) return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);
        if (!account) return res.status(404).send(`Can´t find account by ID`);

        for (const state of account.conversationFlow.states) {
            if (state._id.toString() == idState) {
                stateExist = true;
                break;
            }
            stateIndex++;
        }

        if (!stateExist) return res.status(404).send(`Can´t find state by ID`);

        for (const transition of account.conversationFlow.transitions)
            if (transition.exit._id.toString() == idState ||
                transition.arrival._id.toString() == idState) {
                stateInUse = true;
                break;
            }

        if (stateInUse) return res.status(400).send(`Can´t delete, state in use`);
        account.conversationFlow.states.splice(stateIndex, 1);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteState): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Eliminar transiciones
export const deleteTransition = async (req: Request, res: Response) => {
    try {
        const idAccount = req.params.idAccount;
        const idTransition = req.params.idTransition;

        let transitionExist: boolean = false;
        let transitionIndex: number = 0;

        if (!idAccount || !idTransition) return res.status(400).send(`Incomplete data`);

        const account = await accounts.findById(idAccount);
        if (!account) return res.status(404).send(`Can´t find account by ID`);

        for (const transition of account.conversationFlow.transitions) {
            if (transition._id.toString() == idTransition) {
                transitionExist = true;
                break;
            }
            transitionIndex++;
        }

        if (!transitionExist) return res.status(400).send(`Can´t find transition by ID`);
        account.conversationFlow.transitions.splice(transitionIndex, 1);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteTransition): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}