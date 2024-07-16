import { ConversationFlow } from './../Interfaces/Account';


export function phoneValidation(phone: string) {
    const regex = /^\d{10}$/;
    return regex.test(phone);
}

//TODO
export function conversationFlowValidation(conversationFlow: ConversationFlow) {
    console.log(conversationFlow);
    
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