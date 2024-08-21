import { Account } from "../Interfaces/Account";
import { Conversation } from "../Interfaces/Conversation";
import { ConversationFlow } from "../Interfaces/ConversationFlow";
import { Message } from "../Interfaces/Message";
import { NextState } from "../Interfaces/NextState";
import { State } from "../Interfaces/State";
import { Transition } from "../Interfaces/Transition";
import { User } from "../Interfaces/User";
import { accountToString, userToString } from "./objectToString";

export function getNextStates(ConversationFlow: ConversationFlow, currentState: State): NextState[] {
    let nextStates: NextState[] = [];
    ConversationFlow.transitions.forEach(transition => {
        if (transition.exitState == currentState) {
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

function getAvailability(transition: Transition): boolean {
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

export function initMessages(user: User, account: Account): Message[] {
    const messages: Message[] = [];
    const content: string = `This is your information: ${accountToString(account)}
                            This is the user information you are talking with: ${userToString(user)}`;

    const message: Message = {
        from: 'system',
        content: content,
        feelings: null
    }
    messages.push(message);

    return messages;
}

export function conversationExists(user: User, account: Account): [false, number, string] | [true, Conversation] {
    if(!user || !account)
        return [false, 404, "Can´t find User or Account by Id"];

    
}
