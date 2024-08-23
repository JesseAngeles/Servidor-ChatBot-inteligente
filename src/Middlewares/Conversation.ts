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
import { accountToString, userToString } from "./objectToString";

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
    const content: string = `This is your information: ${accountToString(account)}` +
        `This is the user information you are talking with: ${userToString(user)}`;

    const message: Message = {
        from: 'system',
        content: content,
        feelings: null
    }
    messages.push(message);

    return messages;
}

export function conversationExists(user: User | null, account: Account | null): [false, string] | [true, Conversation] {
    if (!user || !account)
        return [false, "Can´t find User or Account by Id"];

    const conversation = user.conversations?.find(conversation => conversation.account._id.toString() == account._id.toString());
    if (!conversation)
        return [false, "Can´t find conversation between User and Account"];

    return [true, conversation];
}

// OBtener estados disponibles
export function availableStates(nextStates: NextState[] | null): NextState[] {
    let availableNextStates: NextState[] = [];
    if (nextStates)
        nextStates.forEach(nextState => {
            if (nextState.available)
                availableNextStates.push(nextState);
        });

    return availableNextStates;
}

export function setVariables(variables: ConditionValue[] | null, values: ConditionIndexInput[]): ConditionValue[] {
    if (!variables) return [];
    variables.forEach(variable => {
        values.forEach(value => {
            if (variable.condition._id.toString() === value.idCondition)
                variable.indexValue = value.indexValue;
        })
    })

    return variables;
}

export function setVariablesInNextStates(variables: ConditionValue[] | null, nextStates: NextState[] | null): NextState[] {
    if(!nextStates || !variables) return []

    nextStates.forEach(nextState => {
        nextState.conditions?.forEach(orConditions => {
            orConditions.forEach(condition => {
                condition.indexValue = variables.find(variable => variable.condition._id.toString() === condition.condition._id.toString())?.indexValue!;
                })
        })
    })

    return nextStates;
}

function getAvailabilityNextState(nextState: NextState): boolean {
    let orValue = 0;
    nextState.conditions?.forEach(orConditions => {
        let andValue = 1;
        orConditions.forEach(condition => {
            andValue *= +(condition.indexExpected == condition.indexValue);
        })
        orValue += +andValue;
    })
    return (orValue || !nextState.conditions ? true : false);
}

export function setAvailability(nextStates: NextState[]): NextState[] {
    if (!nextStates) return [];
    nextStates.forEach(nextState => {
        nextState.available = getAvailabilityNextState(nextState);
    })

    return nextStates;
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

// Cambia de estado actual
export function updateCurrentState(nextStates: NextState[] | null, idState: string): State | undefined {
    const available = availableStates(nextStates);
    const nextState = available.find(state => state.state._id.toString() == idState);
    return nextState?.state;
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
