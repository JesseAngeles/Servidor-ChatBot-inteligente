import mongoose from "mongoose";
import { Condition } from "../Interfaces/Condition";
import { ConversationFlow } from "../Interfaces/ConversationFlow";
import { State } from "../Interfaces/State";
import { Transition } from "../Interfaces/Transition";
import { NextState } from "../Interfaces/NextState";

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
export function conditionAsignation(currentConditions: Condition[], newConditions: Condition[]): Condition[] {
    const currentConditionNames = new Set(currentConditions.map(condition => condition.name));

    for (const newCondition of newConditions) {
        const newConditionValues = new Set(newCondition.values.map(value => value));
        let currentCondition = currentConditions.find(condition => condition.name === newCondition.name);

        if (currentCondition) {//* Si la condición ya existe, agregar nuevos valores evitando duplicados
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
    const state: State = {
        _id: new mongoose.Types.ObjectId(),
        name: "init",
        description: "First state"
    }

    conversationFlow.states = [state];
    return [conversationFlow, state];
}

// Actualizar nextStates
export function updateNextStates(currentState: State, transitions: Transition[]): NextState[] {
    let nextStates: NextState[] = [];

    let andConditons: Condition[] = [];

    transitions.forEach(transition => {
        if (transition.exitState._id.toString() == currentState._id.toString()) {
            transition.conditions?.forEach(orConditions => {
                orConditions.forEach(condition => {
                    // console.log(condition[0]._id);
                })
            })
        }
    })

    return nextStates;
}

