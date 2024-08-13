import { Condition } from "../Interfaces/Condition";
import { ConditionValue } from "../Interfaces/ConditionValue";
import { State } from "../Interfaces/State";
import { Transition } from "../Interfaces/Transition";

export function idValidation(id: string): boolean {
    return (id ? true : false);
}

export function nameValidation(name: string): boolean {
    return (name ? true : false);
}

export function contextValidation(context: string): boolean {
    return (context ? true : false);
}

export function descriptionValidation(description: string): boolean {
    return (description ? true : false);
}

export function phoneValidation(phone: string): boolean {
    const regex = /^\d{10}$/;
    return regex.test(phone);
}

export function emailValidation(email: string): boolean {
    const regex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

// Valida que los estados existan y sean diferentes
export function statesValidation(states: State[], idExit: string, idArrival: string): [any, any] {
    let flagCounter: number = 0;

    states.forEach(state => {
        if (idExit == state._id.toString()) flagCounter++;
        else if (idArrival == state._id.toString()) flagCounter++;
    });

    return (flagCounter == 2) ? [
        states.find(state => state._id.toString() == idExit)!,
        states.find(state => state._id.toString() == idArrival)!
    ] : [null, null];
}

export function conditionsValidation(conditions: ConditionValue[][],
    currentConditions: Condition[]): ConditionValue[][] {

    const validConditions: ConditionValue[][] = [];
    for (const orConditions of conditions) {
        if (!orConditions || !Array.isArray(orConditions)) continue;
        const validOrConditions: ConditionValue[] = [];

        for (const conditionObject of orConditions) {

            const { condition, indexExpected, indexValue } = conditionObject;

            const currentCondition = currentConditions.find(cond => cond._id.toString() == condition);

            if (currentCondition && indexExpected < currentCondition.values.length && indexExpected >= 0)
                if (!validOrConditions.find(condition => condition.condition._id.toString() == currentCondition._id.toString())) {
                    const conditionPush: ConditionValue = {
                        condition: currentCondition,
                        indexExpected: indexExpected,
                        indexValue: (indexValue ? indexValue : -1)
                    }
                    validOrConditions.push(conditionPush);
                }
        }

        if (validOrConditions.length > 0)
            validConditions.push(validOrConditions);
    }
    return validConditions;
}

export function transitionValidation(transition: Transition, transitions: Transition[]): boolean {
    for (const currentTransition of transitions) {
        if (transition.exitState._id.toString() == currentTransition.exitState._id.toString() &&
            transition.arrivalState._id.toString() == currentTransition.arrivalState._id.toString()) {
            return false;
        }
    };
    return true;
}

export function constraintExists(constraints: any[], idConstraint: string, name: string): number {
    let constraintExists: boolean = false;
    let nameUnique: boolean = true;
    let indexConstraint: number = 0;

    for (const constraint of constraints) {
        if (constraint._id.toString() == idConstraint) {
            constraintExists = true;
            indexConstraint = constraints.findIndex(cond => cond._id == constraint._id);
        } else if (constraint.name == name) {
            nameUnique = false;
            break;
        }
    }
    return (constraintExists && nameUnique ? indexConstraint : -1);
}

export function transitionExists(transitions: Transition[], idTransition: string): number {
    let transitionIndex: number = 0;
    let transitionExists: boolean = false;
    for (const transition of transitions) {
        if (transition._id.toString() == idTransition) {
            transitionExists = true;
            break;
        }
        transitionIndex++;
    }

    return (transitionExists ? transitionIndex : -1);
}

export function conditionInUse(transitions: Transition[], idCondition: string): boolean {
    for (const transition of transitions) {
        if (!transition.conditions) continue;
        for (const orCondition of transition.conditions)
            for (const condition of orCondition)
                if (condition.condition._id.toString() == idCondition)
                    return true;
    }
    return false;
}

export function stateInUse(transitions: Transition[], idState: string): boolean {
    for (const transition of transitions)
        if (transition.exitState._id.toString() == idState ||
            transition.arrivalState._id.toString() == idState) {
            return true;
        }
    return false;
}

export function updateStateValidation(state: State, name: string, description: string): State {
    if (nameValidation(name))
        state.name = name;
    if (descriptionValidation(description))
        state.description = description;
    return state;
}