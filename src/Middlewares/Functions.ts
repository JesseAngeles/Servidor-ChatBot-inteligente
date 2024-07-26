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