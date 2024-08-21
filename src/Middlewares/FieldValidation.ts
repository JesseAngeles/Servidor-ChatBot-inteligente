import { Account } from "../Interfaces/Account";
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

export function updateDefaultStateValidation(state: State): boolean {
    return (state.name == `init` || state.name == `deinit` ? false : true);
}

export function aditionalInformationValidation(information: any[]): {[key: string]: string}[] {
    const informationReturn: {[key: string]: string}[] = [];
    
    if (information && Array.isArray(information)) {
        information.forEach(info => {
            if (typeof info === 'object' && info !== null && !Array.isArray(info)) {
                informationReturn.push(info as {[key: string]: string});
            }
        });
    }
    
    return informationReturn;
}
