import { Condition, State, Transition } from './../Interfaces/ConversationFlow';
import { Request, Response } from 'express';
import accounts from "../Models/Account";
import mongoose from 'mongoose';
import { conditionInUse, conditionsValidation, constraintExists, idValidation, nameValidation, stateInUse, statesValidation, transitionExists, transitionValidation } from '../Middlewares/FieldValidation';
import { conditionAsignation, stateAsignation } from '../Middlewares/Functions';

// Añadir condiciones y estados
export const addConstraints = async (req: Request, res: Response) => {
    try {
        const idAccount: String = req.params.idAccount;
        const { conditions, states }: { conditions: Condition[], states: State[] } = req.body;

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);

        if (!conditions || !Array.isArray(conditions) //* conditions es un arreglo
            || !conditionAsignation(account.conversationFlow.conditions, conditions))
            return res.status(404).send(`Can´t register empty values`);

        if (states && Array.isArray(states)) //* states es un arreglo
            stateAsignation(account.conversationFlow.states, states);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.log(`Error (Controllers/ConversationFlow/addConstraints): ${error}`);
        return res.status(500).json(error);
    }
}

// Añadir transiciones
export const setTransition = async (req: Request, res: Response) => {
    try {
        const idAccount: String = req.params.idAccount;
        const { idExit, idArrival, conditions }: {
            idExit: string, idArrival: string,
            conditions: [Condition, number][][]
        } = req.body;

        const account = await accounts.findById(idAccount);
        if (!account) //* la cuenta existe en la base de datos
            return res.status(404).send(`Can´t find account by ID`);

        //* Validación de estados
        const [exitState, arrivalState] = statesValidation(account.conversationFlow.states, idExit, idArrival);
        if (!exitState || !arrivalState)
            return res.status(400).send(`Can't find exit or arrival state`);

        //* Validación de condiciones y valores
        const validConditions = (conditions ? conditionsValidation(conditions, account.conversationFlow.conditions) : []);

        const transition: Transition = {
            _id: new mongoose.Types.ObjectId(),
            exit: exitState,
            arrival: arrivalState,
            conditions: (validConditions.length > 0 ? validConditions : null),
        };

        // * Verificar si la transición ya existe
        if (!transitionValidation(transition, account.conversationFlow.transitions))
            return res.status(400).send('Transition already exists');

        account.conversationFlow.transitions.push(transition);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.log(`Error (Controllers/ConversationFlow/setTransition)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Consultar flujo conversacional 
export const getConversation = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;

        const account = await accounts.findById(id);
        if (!account)
            return res.status(404).send(`Can´t  find account by ID`);

        return res.status(200).json(account.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/getConversation): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Actualizar condiciones
export const updateCondition = async (req: Request, res: Response) => {
    try {
        const { idAccount, idCondition } = req.params;
        const { name, values } = req.body;

        if (!idValidation(idAccount) || !idValidation(idCondition))
            return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send('Can´t find account by ID')

        //* Validación si existe la condicion
        const indexCondition = constraintExists(account.conversationFlow.conditions, idCondition, name);
        if (indexCondition < 0)
            return res.status(400).send('Can´t update condition');

        if (nameValidation(name))
            account.conversationFlow.conditions[indexCondition].name = name;
        if (values && Array.isArray(values) && values.length > 1)
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
        const { idAccount, idState } = req.params;
        const { name, description } = req.body;

        if (!idValidation(idAccount) || !idValidation(idState))
            return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send('Can´t find account by ID')

        //* Validación si existe el estado
        const indexState = constraintExists(account.conversationFlow.states, idState, name)
        if (indexState < 0)
            return res.status(400).send('Can´t update state');

        if (nameValidation(name))
            account.conversationFlow.states[indexState].name = name;
        if (description)
            account.conversationFlow.states[indexState].description = description;

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
        const { idAccount, idCondition } = req.params;

        if (!idValidation(idAccount) || !idValidation(idCondition))
            return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);

        //* Validacion si existe la condicion
        const conditionIndex = constraintExists(account.conversationFlow.conditions, idCondition, "");
        if (conditionIndex < 0)
            return res.status(404).send(`Can´t find condition by ID`);

        //* Validación si la condicion no esta en uso
        if (conditionInUse(account.conversationFlow.transitions, idCondition))
            return res.status(400).send(`Can´t delete, condition in use`);

        account.conversationFlow.conditions.splice(conditionIndex, 1);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteCondition): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//todo Eliminar estados
export const deleteState = async (req: Request, res: Response) => {
    try {
        const { idAccount, idState } = req.params;

        if (!idValidation(idAccount) || !idValidation(idState))
            return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);

        //* Validación si existe el estado
        const stateIndex = constraintExists(account.conversationFlow.states, idState, "");
        if (stateIndex < 0)
            return res.status(404).send(`Can´t find state by ID`);

        //* Validación que no este en uso el estado
        if (stateInUse(account.conversationFlow.transitions, idState))
            return res.status(400).send(`Can´t delete, state in use`);

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
        const { idAccount, idTransition } = req.params;

        if (!idValidation(idAccount) || !idValidation(idTransition))
            return res.status(400).send(`Incomplete data`);

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);

        //* Vaidación si la transicion existe
        const transitionIndex = transitionExists(account.conversationFlow.transitions, idTransition);
        if (transitionIndex < 0)
            return res.status(400).send(`Can´t find transition by ID`);

        account.conversationFlow.transitions.splice(transitionIndex, 1);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteTransition): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}