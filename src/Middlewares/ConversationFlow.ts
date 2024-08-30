import { Condition } from "../Interfaces/Condition";
import { ConditionValue } from "../Interfaces/ConditionValue";
import { State } from "../Interfaces/State";
import { Transition } from "../Interfaces/Transition";

// Asignate conditions in conversation flow
export function conditionAsignation(currentConditions: Condition[], newConditions: Condition[], transitions: Transition[]): Condition[] {
    for (const newCondition of newConditions) {
        const newConditionValues = new Set(newCondition.values.map(value => value));
        let currentCondition = currentConditions.find(condition => condition.name === newCondition.name);

        //* if condition exists and it's not in use, add new values except duplicates
        if (currentCondition && !conditionInUse(transitions, currentCondition?._id)) {
            const currentValuesSet = new Set(currentCondition.values);
            newCondition.values.forEach(newValue => {
                if (!currentValuesSet.has(newValue)) {
                    currentCondition!.values.push(newValue);
                    currentValuesSet.add(newValue);
                }
            });
        } else //* If condition don´t exists,add current conditions
            if (newConditionValues.size <= 1) continue;
            else currentConditions.push(newCondition);
    };

    return currentConditions;
}

// Asignate states in covnersation flow
export function stateAsignation(currentStates: State[], newStates: State[]): State[] {
    const currentStateSet = new Set(currentStates.map(state => JSON.stringify({
        name: state.name
    })));

    newStates.forEach(newState => { //* Check if state it's in current states 
        const isNewStatePresent = Array.from(currentStateSet).some(stateStr => {
            const stateObj = JSON.parse(stateStr);
            return newState.name === stateObj.name;
        });

        if (!isNewStatePresent) { //* If isn't, add to currentStates and current State Set
            currentStates.push(newState);
            currentStateSet.add(JSON.stringify({
                name: newState.name
            }));
        }
    });

    return currentStates;
}

// States must exists and be diferents
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

export function stateInUse(transitions: Transition[], idState: string): boolean {
    return (transitions.find(transition =>
        transition.exitState._id.toString() == idState ||
        transition.arrivalState._id.toString() == idState
    ) ? true : false)
}
