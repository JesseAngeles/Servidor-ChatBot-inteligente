import { State, Condition, Transition } from "../Interfaces/ConversationFlow";

export function idValidation(id: string): boolean {
    return (id ? true : false);
}

export function nameValidation(name: string): boolean {
    return (name ? true : false);
}

export function phoneValidation(phone: string): boolean {
    const regex = /^\d{10}$/;
    return regex.test(phone);
}

export function emailValidation(email: string): boolean {
    const regex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

export function statesValidation(states: State[], idExit: string, idArrival: string): [State, State] {
    let flagCounter: number = 0;
    let exitState: State = Object(null);
    let arrivalState: State = Object(null);

    states.forEach(state => {
        if (idExit = state._id.toString()) flagCounter++;
        else if (idArrival = state._id.toString()) flagCounter++;
    });
    if (flagCounter == 2) {
        exitState = states.find(state => state._id.toString() == idExit)!;
        arrivalState = states.find(state => state._id.toString() == idArrival)!;
    }
    return [exitState, arrivalState];
}

export function conditionsValidation(conditions: [Condition, number][][], currentConditions: Condition[]): [Condition, number][][] {
    const validConditions: [Condition, number][][] = [];
    conditions.forEach(orConditions => {
        const validOrConditions: [Condition, number][] = [];
        orConditions.forEach(condition => {
            const [conditionId, position] = condition;
            const currentCondition = currentConditions.find(cond => cond._id.toString() == conditionId);

            if (currentCondition && position < currentCondition.values.length && position >= 0)
                validOrConditions.push([currentCondition, position]);
        })
        if (validOrConditions.length > 0)
            validConditions.push(validOrConditions);
    })
    return validConditions;
}

export function transitionValidation(transition: Transition, transitions: Transition[]): boolean {
    return !transitions.some(currentTransition => {
        return currentTransition.exit._id === transition._id &&
            currentTransition.arrival._id === transition._id;
    })
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
    return (constraintExists && nameUnique ? indexConstraint : 0);
}

export function transitionExists(transitions: Transition[], idTransition: string): number {
    let transitionIndex: number = 0;
    let transitionExists:boolean = false;
    for (const transition of transitions) {
        if (transition._id.toString() == idTransition) {
            transitionExists = true;
            break;
        }
        transitionIndex++;
    }

    return (transitionExists ? transitionIndex : 0);
}

export function conditionInUse(transitions: Transition[], idCondition: string): boolean {
    for (const transition of transitions) {
        if (!transition.conditions) continue;
        for (const orCondition of transition.conditions)
            for (const condition of orCondition)
                if (condition[0]._id.toString() == idCondition)
                    return true;
    }
    return false;
}

export function stateInUse(transitions: Transition[], idState: string): boolean {
    for (const transition of transitions)
        if (transition.exit._id.toString() == idState ||
            transition.arrival._id.toString() == idState) {
            return true;
        }
    return false;
}