import { Request, Response } from "express";
import accounts from "../Models/Account";
import users from "../Models/User";
import { NextState } from './../Interfaces/NextState';
import { ConditionIndexInput } from '../Interfaces/ConditionIndexInput';
import { idValidation } from "../Middlewares/FieldValidation";
import { getAvailableStates, conversationExists, getConversation, setNextStates, setVariablesInNextStates, updateNextStates, updateVariables, changeCurrentState, updateNextStatesAvailability } from '../Middlewares/Conversation';
import { Message } from "../Interfaces/Message";
import { stateToString } from "../Middlewares/objectToString";
import { Conversation } from "../Interfaces/Conversation";

export const getAll = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        const result = await getConversation(idUser, idAccount);
        if (!result[0])
            return res.status(result[1]).send(result[2]);
        const conversation: Conversation = result[2];

        return res.status(200).json(conversation.nextStates);
    } catch (error) {
        console.error(`Error (Controllers/NextStates/getAll)`, error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
};


export const availableStates = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        const result = await getConversation(idUser, idAccount);
        if (!result[0])
            return res.status(result[1]).send(result[2]);
        const conversation: Conversation = result[2];

        const nextStates: NextState[] = getAvailableStates(conversation.nextStates);
        return res.status(200).json(nextStates);
    } catch (error) {
        console.error(`Error (Controllers/NextState/availableStates)`, error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}

export const updateConditionValue = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;
        const values: ConditionIndexInput[] = req.body.values;

        const result = await getConversation(idUser, idAccount);
        if (!result[0])
            return res.status(result[1]).send(result[2]);
        const [, user, conversation] = result;

        //* Actualizar variables
        conversation.variables = updateVariables(conversation.variables, values);

        //* Actualizar nextStates.conditions
        conversation.nextStates = setVariablesInNextStates(conversation.variables, conversation.nextStates);

        //* Actualizar availability
        conversation.nextStates = updateNextStatesAvailability(conversation.nextStates);

        await user?.save();
        return res.status(200).json(conversation.nextStates);
    } catch (error) {
        console.error(`Error (Controllers/NextState/updateConditionValue)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}

export const changeState = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount, idState } = req.params;

        const result = await getConversation(idUser, idAccount);
        if (!result[0])
            return res.status(result[1]).send(result[2]);
        const [, user, conversation] = result;

        //* Actualizas el estado actual
        const currentState = changeCurrentState(conversation.nextStates, idState);
        if (!currentState)
            return res.status(404).send(`Can´t find State in available States`);
        
        //* Actualiza current State
        conversation.currentState = currentState;

        //* Actualiza nextStates
        conversation.nextStates = setNextStates(conversation.currentState, conversation.account.conversationFlow.transitions, conversation.variables);

        //* Actualizar nextStates.conditions
        conversation.nextStates = setVariablesInNextStates(conversation.variables, conversation.nextStates);

        //* Actualizar availability
        conversation.nextStates = updateNextStatesAvailability(conversation.nextStates);

        const message: Message = {
            from: "system",
            content: stateToString(conversation.currentState),
            feelings: null
        }
        conversation.messages?.push(message);

        await user?.save();
        return res.status(200).json(conversation);
    } catch (error) {
        console.error(`Error (Controllers/NextState/changeState)`);
        console.log(error);
        return res.status(500).send(`Internal server error: ${error}`);
    }
}

export const resetConversationFlow = async (req: Request, res: Response) => {
    try {
        const { idUser, idAccount } = req.params;

        if (!idValidation(idUser) || !idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const user = await users.findById(idUser);
        const account = await accounts.findById(idAccount);
        const [exist, result] = conversationExists(user, account)
        if (!exist)
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