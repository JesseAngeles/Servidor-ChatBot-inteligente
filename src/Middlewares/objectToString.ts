import { Account } from "../Interfaces/Account";
import { Bayes } from "../Interfaces/Bayes";
import { ConditionValue } from "../Interfaces/ConditionValue";
import { State } from "../Interfaces/State";
import { User } from "../Interfaces/User";

export function userToString(user: User): string {
    let message: string = '';
    message += `name: ${user.name}. `;

    user.information?.forEach(info => {
        if (info instanceof Map)
            info.forEach((value, key) => {
                message += `${key}: ${value}. `;
            })
    })
    return message;
}

export function accountToString(account: Account): string {
    let message: string = '';
    message += `name: ${account.name}. `;
    message += `context: ${account.context}. `;
    account.information?.forEach(info => {
        if (info instanceof Map)
            info.forEach((value, key) => {
                message += `${key}: ${value}. `;
            });
    })
    return message;
}

export function bayesToString(bayes: Bayes): string {
    let message: string = "Fellings averages:";
    for (const key in bayes) {
        if (Object.prototype.hasOwnProperty.call(bayes, key)) {
            const value = bayes[key as keyof Bayes];
            message += `${key}: ${value}. `
        }
    }
    
    console.log(message);
    return message;
}

export function variablesToString(variables: ConditionValue[]): string {
    let message: string = "Variables needed:";
    variables.forEach(variable => {
        message += `The condition ${variable.condition.name} could take the values of ${variable.condition.values.toString()}. `
    })

    return message;
}

export function stateToString(state: State): string {
    let message: string = "State information: \n";
    message += `name: ${state.name}`;
    message += `desription: ${state.description}`;

    return message;
}
