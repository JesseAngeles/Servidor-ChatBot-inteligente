import users from "../Models/User";
import accounts from "../Models/Account";

import { Account } from "../Interfaces/Account";
import { ConditionIndexInput } from "../Interfaces/ConditionIndexInput";
import { ConditionValue } from "../Interfaces/ConditionValue";
import { Conversation } from "../Interfaces/Conversation";
import { ConversationFlow } from "../Interfaces/ConversationFlow";
import { Message } from "../Interfaces/Message";
import { NextState } from "../Interfaces/NextState";
import { State } from "../Interfaces/State";
import { Transition } from "../Interfaces/Transition";
import { User } from "../Interfaces/User";
import { accountToString, userToString, variablesToString } from "./objectToString";
import { idValidation } from "./FieldValidation";
import mongoose from "mongoose";
import { generateResponse } from "../Services/OpenAi";

export async function initConversation(user: User, account: Account, theyKnown: boolean): Promise<Conversation> {
    const initState = account.conversationFlow.states.find(state => state.name == 'init')!;
    const variables = getVariables(account.conversationFlow.transitions);
    const nextStates = getNextStates(account.conversationFlow, initState);
    const messages = await initMessages(user, account, theyKnown, variables);

    const conversation: Conversation = {
        account: account,
        currentState: initState,
        messages: messages,
        nextStates: nextStates,
        variables: variables
    }

    return conversation;
}


async function initMessages(user: User, account: Account, theyKnown: boolean, variables: ConditionValue[]): Promise<Message[]> {
    const messages: Message[] = [];
    let content: string = `This is your role in the conversation: ${accountToString(account)}`;
    if (variables.length > 0)
        content += `Your conversation probably will need the next variables: ${variablesToString(variables)}`;
    if (theyKnown)
        content += `This is the user information you are talking with: ${userToString(user)}. ${user.name} `;
    else
        content += `someone `;
    content += `is in front of you. Say something to (her/him). No more than 10 words`;

    const systemMessage: Message = {
        from: 'system',
        content: content,
        feelings: null
    }

    messages.push(systemMessage);
    const assistantMessages = await generateResponse(messages);
    messages.push(assistantMessages);

    return messages;
}

export async function getConversation(idUser: string, idAccount: string): Promise<[true, any, Conversation] | [false, number, string]> {
    try {
        //* Validación de IDs
        if (!idValidation(idUser) || !idValidation(idAccount)) {
            return [false, 400, `Missing required fields`];
        }

        //* Búsqueda 
        const [user, account] = await Promise.all([
            users.findById(idUser),
            accounts.findById(idAccount),
        ]);

        //* Verificación de que ambos existan
        if (!user || !account)
            return [false, 404, `Can't find User or Account by Id`];

        //* Encontrar el índice de la conversación si existe
        const conversation: Conversation | undefined = user.conversations?.find(conversation => conversation.account._id.equals(account._id));
        return (conversation ? [true, user, conversation] : [false, 404, `Can´t find conversation between User and Account`]);

    } catch (error) {
        return [false, 500, `Internal server error: ${error}`];
    }
}

export function getAvailableStates(nextStates: NextState[] | null): NextState[] {
    let availableNextStates: NextState[] = [];
    if (nextStates)
        nextStates.forEach(nextState => {
            if (nextState.available)
                availableNextStates.push(nextState);
        });

    return availableNextStates;
}

export function updateVariables(variables: ConditionValue[] | null, values: ConditionIndexInput[] | null): ConditionValue[] {
    if (!variables) return [];
    if (variables && values) {
        variables.forEach(variable => {
            const value: number = values.find(value => variable.condition._id.toString() === value.idCondition)?.indexValue ?? -1;
            if (value != -1)
                variable.indexValue = value;
        })
    }

    return variables;
}

export function setVariablesInNextStates(variables: ConditionValue[] | null, nextStates: NextState[] | null): NextState[] {
    if (!nextStates || !variables) return []

    nextStates.forEach(nextState => {
        nextState.conditions?.forEach(orConditions => {
            orConditions.forEach(condition => {
                condition.indexValue = variables.find(variable => variable.condition._id.toString() === condition.condition._id.toString())?.indexValue!;
            })
        })
    })

    return nextStates;
}

export function updateNextStatesAvailability(nextStates: NextState[]): NextState[] {
    if (!nextStates) return [];
    nextStates.forEach(nextState => {
        nextState.available = getAvailability(nextState);
    })

    return nextStates;
}

function getAvailability(transition: Transition | NextState): boolean {
    let orValue = 0;
    transition.conditions?.forEach(orConditions => {
        let andValue = 1;
        orConditions.forEach(condition => {
            andValue *= +(condition.indexExpected == condition.indexValue);
        })
        orValue += +andValue;
    })
    return (orValue || !transition.conditions ? true : false);
}

export function changeCurrentState(nextStates: NextState[] | null, idState: string): State | undefined {
    const available = getAvailableStates(nextStates);
    return available.find(state => state.state._id.toString() == idState)?.state;
}

export function setNextStates(currentState: State, transitions: Transition[], variables: ConditionValue[] | null): NextState[] {
    let nextStates: NextState[] = [];

    transitions.forEach(transition => {
        let nextState: NextState = Object(null);
        if (transition.exitState._id.toString() === currentState._id.toString()) {

            nextState = {
                state: transition.arrivalState,
                conditions: transition.conditions,
                available: (!transition.conditions ? true : false)
            }
            if (variables)
                nextState.conditions?.forEach(OrConditions => {
                    OrConditions.forEach(condition => {
                        condition = variables.find(variable => variable === condition)!;
                    })
                })
        }

        nextState.available = getAvailability(nextState);

        if (nextState.state)
            nextStates.push(nextState);
    })

    return nextStates;
}

export function getVariables(transitions: Transition[]): ConditionValue[] {
    const variables: ConditionValue[] = [];
    transitions.forEach(transition => {
        transition.conditions?.forEach(orCondition => {
            orCondition.forEach(condition => {
                variables.push(condition);
            })
        })
    });

    return variables;
}

export function getNextStates(ConversationFlow: ConversationFlow, currentState: State): NextState[] {
    let nextStates: NextState[] = [];
    ConversationFlow.transitions.forEach(transition => {
        if (transition.exitState._id.toString() === currentState._id.toString()) {
            const nextState = {
                state: transition.arrivalState,
                conditions: transition.conditions,
                available: getAvailability(transition),
            }

            nextStates.push(nextState);
        }
    })

    return nextStates;
}

export function conversationExists(user: User | null, account: Account | null): [false, string] | [true, Conversation] {
    if (!user || !account)
        return [false, "Can´t find User or Account by Id"];

    const conversation = user.conversations?.find(conversation => conversation.account._id.toString() == account._id.toString());
    if (!conversation)
        return [false, "Can´t find conversation between User and Account"];

    return [true, conversation];
}

export function setConditionValue(nextStates: NextState[] | null, values: ConditionIndexInput[]) {
    if (nextStates)
        nextStates.forEach(nextState => {
            let orValue = 0;
            nextState.conditions?.forEach(orConditions => {
                let andValue = 1;
                orConditions.forEach(condition => {
                    const value = values.find(value => value.idCondition == condition.condition._id.toString());
                    if (value?.idCondition && condition.condition.values[value.indexValue].toString()) {
                        condition.indexValue = value.indexValue;
                        andValue *= +(condition.indexExpected == condition.indexValue);
                    } else andValue *= 0;
                })
                orValue += +andValue;
            })
            nextState.available = (orValue ? true : false);
        })


    return nextStates;
}


// Actualizar nextStates
export function updateNextStates(currentState: State, transitions: Transition[]): NextState[] {
    let nextStates: NextState[] = [];

    transitions.forEach(transition => {
        let nextState: NextState = Object(null);
        if (transition.exitState._id.toString() == currentState._id.toString()) {
            nextState = {
                state: transition.arrivalState,
                conditions: transition.conditions,
                available: (!transition.conditions ? true : false)
            }
        }

        let orValue = 0;
        transition.conditions?.forEach(orCondition => {
            let andValue = 1;
            orCondition.forEach(condition => {
                andValue *= +(condition.indexExpected == condition.indexValue);
            })
            orValue += +andValue;
        })
        nextState.available = (orValue || !nextState.conditions ? true : false);

        if (nextState.state)
            nextStates.push(nextState);
    })

    return nextStates;
}
