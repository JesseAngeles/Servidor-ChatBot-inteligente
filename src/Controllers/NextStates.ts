import { NextState } from './../Interfaces/NextState';
import { Request, Response } from "express";
import { idValidation } from "../Middlewares/FieldValidation";
import accounts from "../Models/Account";
import users from "../Models/User";
import { availableStates, setConditionValue, setConditionValueOnCascade, updateCurrentState, updateNextStates } from "../Middlewares/Functions";
import { ConditionIndexInput } from '../Interfaces/ConditionIndexInput';
import { Conversation } from '../Interfaces/Conversation';

export const getAll = async (req: Request, res: Response) => {
    try {
        const {idUser, idAccount} = req.params;

        if(!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        if (!user || !account)
            return res.status(404).send(`Can´t find User or Account by Id`);

        const conversation = user.conversations?.find(conversation => conversation.account == account);
        if (!conversation)
            return res.status(404).send(`Can´t find conversation between User and Account`);
        
        return res.status(200).json(conversation.nextStates);
    } catch (error) {
        console.error(`Error (Controllers/NextStates/getAll)`);
        console.log(error);
        return res.status(500).send(`internal server error: ${error}`);        
    }
}

//! Prueba de la función que establece los siguientes estados
export const setNextStates = async (req: Request, res: Response) => {
    try {
        const idAccount = req.params.idAccount;

        if (!idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);


        //* actualizar información
        account.nextStates = updateNextStates(account.currentState, account.conversationFlow.transitions);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.nextStates);
    } catch (error) {
        console.log(`Error (Controllers/account/setNextStates)`);
        console.log(error);
        return res.status(500).send(`Server errro: ${error}`);
    }
}

//! Actualiza el valor del indice de la condicion
export const updateConditionValue = async (req: Request, res: Response) => {
    try {
        const { idAccount } = req.params;
        const values: ConditionIndexInput[] = req.body.values;

        if (!idValidation(idAccount))
            return res.status(400).send('Missing required fields');

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);

        //* Actualiza nextStates
        account.nextStates = setConditionValue(account.nextStates, values);

        //* Actualizar en cascada
        account.conversationFlow.transitions = setConditionValueOnCascade(account.conversationFlow.transitions, values);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.nextStates);
    } catch (error) {
        console.log(`Error (Controllers/account/updateConditionValue)`);
        console.log(error);
        return res.status(500).send(`Server errro: ${error}`);
    }
}

//! Funcion para obtener todos los estados disponibles
export const getAvailableStates = async (req: Request, res: Response) => {
    try {
        const idAccount: string = req.params.idAccount;

        if (!idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);

        const nextStates: NextState[] = availableStates(account.nextStates);

        return res.status(200).send(nextStates);
    } catch (error) {
        console.log(`Error (Controllers/nextState/getAvailableStates)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//! función para cambiar de estados
export const changeState = async (req: Request, res: Response) => {
    try {
        const { idAccount, idState } = req.params;

        if (!idValidation(idAccount) || !idValidation(idState))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find Account by Id`);

        const expectedCurrentState = updateCurrentState(account.nextStates, idState);
        if (!expectedCurrentState)
            return res.status(404).send(`Can´t find State by Id`);

        account.currentState = expectedCurrentState;
        account.nextStates = updateNextStates(account.currentState, account.conversationFlow.transitions);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount);
    } catch (error) {
        console.log(`Error (Controllers/nextState/changeState)`);
        console.log(error);
        return res.status(500).send(`Server errror: ${error}`);
    }
}

//! Función para reiniciar el flujo conversacional
export const resetConversationFlow = async (req: Request, res: Response) => {
    try {
        const idAccount = req.params.idAccount;
        
        if (!idValidation(idAccount))
            return res.status(400).send(`Missing requried fields`);

        const account = await accounts.findById(idAccount);
        if(!account)
            return res.status(404).send(`Can´t find account by Id`);

        const init = account.conversationFlow.states.find(state => state.name == "init");
        if (!init)
            return res.status(400).send(`Init state removed`);

        account.currentState = init;

        const newNextStstes = updateNextStates(account.currentState, account.conversationFlow.transitions);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount);
    } catch (error) {
        console.log(`Error (Controllers/nextState/resetConversationFlow)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}