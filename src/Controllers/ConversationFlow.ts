import { Request, Response } from "express";
import users from "../Models/User";
import accounts from "../Models/Account";
import mongoose from 'mongoose';
import { Condition } from "../Interfaces/Condition";
import { State } from "../Interfaces/State";
import { Transition } from "../Interfaces/Transition";
import { ConditionValue } from "../Interfaces/ConditionValue";
import { descriptionValidation, idValidation, nameValidation, updateDefaultStateValidation } from "../Middlewares/FieldValidation";
import { accountInUse, conditionAsignation, conditionInUse, conditionsValidation, constraintExists, stateAsignation, stateInUse, statesValidation, transitionValidation } from "../Middlewares/Account";


// Añadir condiciones y estados
export const addConstraints = async (req: Request, res: Response) => {
    try {
        const idAccount: string = req.params.idAccount;
        const { conditions, states }: { conditions: Condition[], states: State[] } = req.body;

        if (!idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by Id`);

        const allUsers = await users.find();
        if(accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);


        if (!conditions || !Array.isArray(conditions) //* conditions es un arreglo
            || !conditionAsignation(account.conversationFlow.conditions, conditions, account.conversationFlow.transitions))
            return res.status(404).send(`Can´t register empty values`);

        if (states && Array.isArray(states)) //* states es un arreglo
            stateAsignation(account.conversationFlow.states, states);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/addConstraints)`);
        console.log(error);
        return res.status(500).json(error);
    }
}

// AÑadir multiples transiciones
export const setTransitions = async (req: Request, res: Response) => {
    try {
        const idAccount: string = req.params.idAccount;
        const transitions: { idExit: string; idArrival: string; conditions: ConditionValue[][] }[] = req.body.transitions;

        if (!idValidation(idAccount) || !transitions || !Array.isArray(transitions))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can't find Account by Id`);

        const allUsers = await users.find();
        if(accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);

        for (const transition of transitions) {
            //* Validación de estados
            const [exitState, arrivalState]: [State, State] = statesValidation(account.conversationFlow.states, transition.idExit, transition.idArrival);
            if (!exitState || !arrivalState)
                continue;

            if (exitState.name == `deinit` || arrivalState.name == `init`) 
                continue;

            //* Validacion de condiciones y valores
            const validConditions = (transition.conditions ? conditionsValidation(transition.conditions, account.conversationFlow.conditions) : []);

            const newTransition: Transition = {
                _id: new mongoose.Types.ObjectId,
                exitState: exitState,
                arrivalState: arrivalState,
                conditions: validConditions.length > 0 ? validConditions : null
            };

            //* Varificar si la transition existe
            if (!transitionValidation(newTransition, account.conversationFlow.transitions))
                continue;

            account.conversationFlow.transitions.push(newTransition);
        }
        const updatedAccount = await account.save();
        return res.status(200).send(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/setTransitions)`);
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

        const allUsers = await users.find();
        if(accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);

        return res.status(200).json(account.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/getConversation)`);
        console.log(error);
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

        const allUsers = await users.find();
        if(accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);

        //* Encontrar la condicion a actualizar
        const indexCondition = account.conversationFlow.conditions.findIndex(condition => condition._id.toString() === idCondition);
        if (indexCondition === -1)
            return res.status(404).send('Condition not found');

        //* Validación si la condicion no esta en uso
        if (conditionInUse(account.conversationFlow.transitions, idCondition))
            return res.status(400).send(`Can´t update, condition in use`);

        //* Actualizar la información
        if (nameValidation(name))
            account.conversationFlow.conditions[indexCondition].name = name;
        if (values && Array.isArray(values) && values.length > 1)
            account.conversationFlow.conditions[indexCondition].values = values;

        const updatedCondition = await account.save();
        return res.status(200).json(updatedCondition.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/updateCondition)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Actualizar estados
export const updateState = async (req: Request, res: Response) => {
    try {
        const { idAccount, idState } = req.params;
        const { name, description } = req.body;

        if (!idValidation(idAccount) || !idValidation(idState))
            return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send('Can´t find Account by ID');

        const allUsers = await users.find();
        if(accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);

        //* Encontrar el estado a actualizar
        const state: State | undefined = account.conversationFlow.states.find(state => state._id.toString() == idState);
        if (!state)
            return res.status(404).send(`Can´t find State by ID`);

        if (!updateDefaultStateValidation(state))
            return res.status(400).send(`Can´t update default States`);

        if (stateInUse(account.conversationFlow.transitions, idState))
            return res.status(400).send(`Can´t update, state in use`);
        //* Actualizar estado
        if (nameValidation(name)) state.name = name;
        if (descriptionValidation(description)) state.description = description;

        const updatedState = await account.save();
        return res.status(200).json(updatedState.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/updateState):`);
        console.log(error);
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
            return res.status(404).send(`Can´t find Account by ID`);

        const allUsers = await users.find();
        if(accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);

        //* Validacion si existe la condicion
        const conditionIndex = constraintExists(account.conversationFlow.conditions, idCondition, "");
        if (conditionIndex < 0)
            return res.status(404).send(`Can´t find Condition by ID`);

        //* Validación si la condicion no esta en uso
        if (conditionInUse(account.conversationFlow.transitions, idCondition))
            return res.status(400).send(`Can´t delete, condition in use`);

        account.conversationFlow.conditions.splice(conditionIndex, 1);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteCondition)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Eliminar estados
export const deleteState = async (req: Request, res: Response) => {
    try {
        const { idAccount, idState } = req.params;

        if (!idValidation(idAccount) || !idValidation(idState))
            return res.status(400).send('Invalid format');

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find Account by ID`);

        const allUsers = await users.find();
        if(accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);

        //* Validación si existe el estado
        const stateIndex = constraintExists(account.conversationFlow.states, idState, "");
        if (stateIndex == -1)
            return res.status(404).send(`Can´t find State by ID`);

        if (!updateDefaultStateValidation(account.conversationFlow.states[stateIndex]))
            return res.status(400).send(`Can´t delete default States`);

        //* Validación que no este en uso el estado
        if (stateInUse(account.conversationFlow.transitions, idState))
            return res.status(400).send(`Can´t delete State in use`);

        account.conversationFlow.states.splice(stateIndex, 1);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteState)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Eliminar transiciones on cascade
export const deleteTransition = async (req: Request, res: Response) => {
    try {
        const { idAccount, idTransition } = req.params;

        if (!idValidation(idAccount) || !idValidation(idTransition))
            return res.status(400).send(`Incomplete data`);

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);

        const allUsers = await users.find();
        if(accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);

        //* Obtener transition
        const transitionIndex = account.conversationFlow.transitions.findIndex(transition => transition._id.toString() == idTransition);
        if (transitionIndex == -1)
            return res.status(404).send(`Can't find Transition by ID`);

        console.log(transitionIndex);
        
        account.conversationFlow.transitions.splice(transitionIndex, 1);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteTransition): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}