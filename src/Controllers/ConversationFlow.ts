import { Request, Response } from "express";
import users from "../Models/User";
import accounts from "../Models/Account";
import mongoose from 'mongoose';
import { Condition } from "../Interfaces/Condition";
import { State } from "../Interfaces/State";
import { Transition } from "../Interfaces/Transition";
import { ConditionValue } from "../Interfaces/ConditionValue";
import { descriptionValidation, idValidation, nameValidation, updateDefaultStateValidation } from "../Middlewares/FieldValidation";
import { accountInUse } from "../Middlewares/Account";
import { conditionAsignation, conditionInUse, conditionsValidation, constraintExists, stateAsignation, stateInUse, statesValidation, transitionValidation } from "../Middlewares/ConversationFlow";


// Add conditions and states
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

        if (!conditions || !Array.isArray(conditions)
            || !conditionAsignation(account.conversationFlow.conditions, conditions, account.conversationFlow.transitions))
            return res.status(404).send(`Can´t register empty values`);

        if (states && Array.isArray(states)) 
            stateAsignation(account.conversationFlow.states, states);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/addConstraints)`, error);
        return res.status(500).json(error);
    }
}

// Add multiple transitions
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
            //* state validation
            const [exitState, arrivalState]: [State, State] = statesValidation(account.conversationFlow.states, transition.idExit, transition.idArrival);
            if (!exitState || !arrivalState || exitState.name == 'deinit' || arrivalState.name == 'init')
                continue;

            //* conditions and values validation
            const validConditions = (transition.conditions ? conditionsValidation(transition.conditions, account.conversationFlow.conditions) : []);

            const newTransition: Transition = {
                _id: new mongoose.Types.ObjectId,
                exitState: exitState,
                arrivalState: arrivalState,
                conditions: validConditions.length > 0 ? validConditions : null
            };

            //* check if transition exists
            if (!transitionValidation(newTransition, account.conversationFlow.transitions))
                continue;

            account.conversationFlow.transitions.push(newTransition);
        }
        const updatedAccount = await account.save();
        return res.status(200).send(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/setTransitions)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// get conversation flow: conditions, states and transitions
export const getConversation = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;

        const account = await accounts.findById(id);
        if (!account)
            return res.status(404).send(`Can´t  find account by ID`);

        return res.status(200).json(account.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/getConversation)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

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

        //* Find condition to update
        const indexCondition = account.conversationFlow.conditions.findIndex(condition => condition._id.toString() === idCondition);
        if (indexCondition === -1)
            return res.status(404).send('Condition not found');

        //* chek if conditions isn't in use
        if (conditionInUse(account.conversationFlow.transitions, idCondition))
            return res.status(400).send(`Can´t update, condition in use`);

        //* update condition
        if (nameValidation(name))
            account.conversationFlow.conditions[indexCondition].name = name;
        if (values && Array.isArray(values) && values.length > 1)
            account.conversationFlow.conditions[indexCondition].values = values;

        const updatedCondition = await account.save();
        return res.status(200).json(updatedCondition.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/updateCondition)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

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

        //* Find state to update
        const state: State | undefined = account.conversationFlow.states.find(state => state._id.toString() == idState);
        if (!state)
            return res.status(404).send(`Can´t find State by ID`);

        if (!updateDefaultStateValidation(state))
            return res.status(400).send(`Can´t update default States`);

        if (stateInUse(account.conversationFlow.transitions, idState))
            return res.status(400).send(`Can´t update, state in use`);

        //* update state
        if (nameValidation(name)) state.name = name;
        if (descriptionValidation(description)) state.description = description;

        const updatedState = await account.save();
        return res.status(200).json(updatedState.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/updateState):`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

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

        //* if conditionexists
        const conditionIndex = constraintExists(account.conversationFlow.conditions, idCondition, "");
        if (conditionIndex < 0)
            return res.status(404).send(`Can´t find Condition by ID`);

        //* if conditions isn´t in use
        if (conditionInUse(account.conversationFlow.transitions, idCondition))
            return res.status(400).send(`Can´t delete, condition in use`);

        account.conversationFlow.conditions.splice(conditionIndex, 1);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteCondition)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

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

        //* if state exists
        const stateIndex = constraintExists(account.conversationFlow.states, idState, "");
        if (stateIndex == -1)
            return res.status(404).send(`Can´t find State by ID`);

        if (!updateDefaultStateValidation(account.conversationFlow.states[stateIndex]))
            return res.status(400).send(`Can´t delete default States`);

        //* If state is in use
        if (stateInUse(account.conversationFlow.transitions, idState))
            return res.status(400).send(`Can´t delete State in use`);

        account.conversationFlow.states.splice(stateIndex, 1);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteState)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

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

        const transitionIndex = account.conversationFlow.transitions.findIndex(transition => transition._id.toString() == idTransition);
        if (transitionIndex == -1)
            return res.status(404).send(`Can't find Transition by ID`);

        console.log(transitionIndex);
        
        account.conversationFlow.transitions.splice(transitionIndex, 1);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.conversationFlow);
    } catch (error) {
        console.error(`Error (Controllers/ConversationFlow/deleteTransition):`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}