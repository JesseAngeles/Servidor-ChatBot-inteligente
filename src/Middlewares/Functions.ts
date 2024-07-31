import { Condition, State } from "../Interfaces/ConversationFlow";

// Función para generar cadena de selección en mongoose
export function createSelectString(required: Record<string, any> | undefined,
    availableFields: { [key: string]: boolean },
    defaultSelectString: string): string {
    let select = "";
    if (required) {
        for (const field in required) {
            if (required[field] && availableFields.hasOwnProperty(field)) {
                select += field + " ";
            }
        }
    }

    if (!select) return defaultSelectString;

    return select.trim();
}

export function conditionAsignation(currentConditions: Condition[], newConditions: Condition[]): Condition[] {
    const currentConditionNames = new Set(currentConditions.map(cond => cond.name));

    newConditions.forEach(newCondition => {
        let currentCondition = currentConditions.find(cond => cond.name === newCondition.name);

        if (currentCondition) {//* Si la condición ya existe, agregar nuevos valores evitando duplicados
            const currentValuesSet = new Set(currentCondition.values);

            newCondition.values.forEach(newValue => {
                if (!currentValuesSet.has(newValue)) {
                    currentCondition!.values.push(newValue);
                    currentValuesSet.add(newValue);
                }
            });
        } else //* Si la condición no existe, agregarla a las condiciones actuales
            currentConditions.push(newCondition);
    });

    return currentConditions;
}

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