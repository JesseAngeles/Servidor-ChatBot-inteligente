import { Transition } from "../Interfaces/Transition";
import { ConditionIndexInput } from "../Interfaces/ConditionIndexInput";

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


// Actualizar index

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