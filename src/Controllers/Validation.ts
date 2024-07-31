import { Condition, State } from './../Interfaces/ConversationFlow';



// Función auxiliar para comparar arrays de condiciones
export function arraysEqual(arr1: [Condition, number][], arr2: [Condition, number][]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i][0]._id.toString() !== arr2[i][0]._id.toString() || arr1[i][1] !== arr2[i][1]) {
            return false;
        }
    }
    return true;
}

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