import mongoose from "mongoose";
import { Condition } from "../Interfaces/Condition";
import { ConversationFlow } from "../Interfaces/ConversationFlow";
import { State } from "../Interfaces/State";
import { Transition } from "../Interfaces/Transition";
import { NextState } from "../Interfaces/NextState";
import { ConditionIndexInput } from "../Interfaces/ConditionIndexInput";
import { conditionInUse } from "./FieldValidation";

// Función para generar cadena de selección en mongoose
export function createSelect(required: { [key: string]: boolean },
    availableFields: { [key: string]: boolean }): { [key: string]: boolean } {

    if (!required) return availableFields;
    const selectedFields: { [key: string]: boolean } = {};

    for (const field of Object.keys(required))
        if (availableFields[field] && required[field])
            selectedFields[field] = true;

    return (selectedFields ? selectedFields : availableFields);
}

// Función para asignar las condiciones en el conversationFlow
export function conditionAsignation(currentConditions: Condition[], newConditions: Condition[], transitions: Transition[]): Condition[] {
    for (const newCondition of newConditions) {
        const newConditionValues = new Set(newCondition.values.map(value => value));
        let currentCondition = currentConditions.find(condition => condition.name === newCondition.name);

        //* Si la condicion ya existe y no esta en uso, agregar nuevos valores evitando duplicados
        if (currentCondition && !conditionInUse(transitions, currentCondition?._id)) {
            const currentValuesSet = new Set(currentCondition.values);
            newCondition.values.forEach(newValue => {
                if (!currentValuesSet.has(newValue)) {
                    currentCondition!.values.push(newValue);
                    currentValuesSet.add(newValue);
                }
            });
        } else //* Si la condición no existe, agregarla a las condiciones actuales
            if (newConditionValues.size <= 1) continue;
            else currentConditions.push(newCondition);
    };

    return currentConditions;
}

// Función para asignar los estados en el conversationFlow
export function stateAsignation(currentStates: State[], newStates: State[]): State[] {
    const currentStateSet = new Set(currentStates.map(state => JSON.stringify({
        name: state.name
    })));

    newStates.forEach(newState => { //* Verificar si el estado ya está presente en currentStateSet
        const isNewStatePresent = Array.from(currentStateSet).some(stateStr => {
            const stateObj = JSON.parse(stateStr);
            return newState.name === stateObj.name;
        });

        if (!isNewStatePresent) { //* Si el estado no está presente, agregarlo a currentStates y currentStateSet
            currentStates.push(newState);
            currentStateSet.add(JSON.stringify({
                name: newState.name
            }));
        }
    });

    return currentStates;
}

// Función para inicilizar el flujo conversacional y el estado inicial
export function initConversationFlow(): [ConversationFlow, State] {
    const conversationFlow: ConversationFlow = Object(null);
    const firstState: State = {
        _id: new mongoose.Types.ObjectId(),
        name: "init",
        description: "First state"
    }

    const lastState: State = {
        _id: new mongoose.Types.ObjectId(),
        name: "deinit",
        description: "Last state"
    }

    conversationFlow.states = [firstState, lastState];
    return [conversationFlow, firstState];
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

// Actualizar index
export function setConditionValue(nextStates: NextState[], values: ConditionIndexInput[]) {
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

// Actualiza los index's en conversationFLow
export function setConditionValueOnCascade(transitions: Transition[], values: ConditionIndexInput[]): Transition[] {
    transitions.forEach(transition => {
        transition.conditions?.forEach(orConditions => {
            orConditions.forEach(condition => {
                const value = values.find(value => value.idCondition == condition.condition._id.toString());
                if (value?.idCondition && condition.condition.values[value.indexValue].toString())
                    condition.indexValue = value.indexValue;
            })
        })
    })

    return transitions;
}

// OBtener estados disponibles
export function availableStates(nextStates: NextState[]): NextState[] {
    let availableNextStates: NextState[] = [];
    nextStates.forEach(nextState => {
        if (nextState.available)
            availableNextStates.push(nextState);
    });

    return availableNextStates;
}

// Cambia de estado actual
export function updateCurrentState(nextStates: NextState[], idState: string): State | undefined {
    const available = availableStates(nextStates);
    const nextState = available.find(state => state.state._id.toString() == idState);
    return nextState?.state;
}