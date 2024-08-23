import { Request, Response } from "express";
import accounts from "../Models/Account";
import users from "../Models/User";
import { NextState } from './../Interfaces/NextState';
import { ConditionIndexInput } from '../Interfaces/ConditionIndexInput';
import { idValidation } from "../Middlewares/FieldValidation";
import { availableStates, conversationExists, setAvailability, setNextStates, setVariables, setVariablesInNextStates, updateCurrentState, updateNextStates } from '../Middlewares/Conversation';

export const getAll = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        const [exist, result] = conversationExists(user, account);
        if (!exist)
            return res.status(404).send(`${result}`);

        return res.status(200).json(result.nextStates);
    } catch (error) {
        console.error(`Error (Controllers/NextStates/getAll)`);
        console.log(error);
        return res.status(500).send(`internal server error: ${error}`);
    }
}

export const getAvailableStates = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        const [exist, result] = conversationExists(user, account);
        if (!exist)
            return res.status(404).send(`${result}`);

        const nextStates: NextState[] = availableStates(result.nextStates);
        return res.status(200).json(nextStates);
    } catch (error) {
        console.error(`Error (Controllers/NextState/getAvailableStates)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}

export const updateConditionValue = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;
        const values: ConditionIndexInput[] = req.body.values;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        const [exist, result] = conversationExists(user, account);
        if (!exist)
            return res.status(404).send(`${result}`);

        //* Actualizar variables
        result.variables = setVariables(result.variables, values);

        //* Actualizar nextStates.conditions
        result.nextStates = setVariablesInNextStates(result.variables, result.nextStates);

        //* Actualizar availability
        result.nextStates = setAvailability(result.nextStates);
        
        await user?.save();
        return res.status(200).json(result.nextStates);
    } catch (error) {
        console.error(`Error (Controllers/NextState/updateConditionValue)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}

export const changeState = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount, idState } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount) || !idValidation(idState))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        const [exists, result] = conversationExists(user, account);
        if (!exists)
            return res.status(404).send(`${result}`);

        //* Actualizas el estado actual
        const expectedCurrentState = updateCurrentState(result.nextStates, idState);
        if (!expectedCurrentState)
            return res.status(404).send(`Can´t find State by Id`);

        //* Actualiza nextStates
        result.currentState = expectedCurrentState;
        result.nextStates = setNextStates(result.currentState, result.account.conversationFlow.transitions, result.variables);

        //* Actualizar nextStates.conditions
        result.nextStates = setVariablesInNextStates(result.variables, result.nextStates);

        //* Actualizar availability
        result.nextStates = setAvailability(result.nextStates);

        await user?.save();
        return res.status(200).json(result);
    } catch (error) {
        console.error(`Error (Controllers/NextState/changeState)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}

export const  resetConversationFlow = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount} = req.params;

        if(!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        const [exist, result] = conversationExists(user, account)
        if(!exist)
            return res.status(404).send(`${result}`);

        const init = result.account.conversationFlow.states.find(state => state.name == "init")!;
        result.currentState = init;

        result.nextStates = updateNextStates(result.currentState, result.account.conversationFlow.transitions);
        await user?.save();
        return res.status(200).json(result);
    } catch (error) {
        console.error(`Error (Controllers/NextState/resetConversationFlow)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}