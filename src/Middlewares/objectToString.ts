import { Account } from "../Interfaces/Account";
import { Bayes } from "../Interfaces/Bayes";
import { User } from "../Interfaces/User";

export function userToString(user: User): string {
    let message: string = '';
    message += `name: ${user.name}, `;

    user.information?.forEach(info => {
        if (info instanceof Map)
            info.forEach((value, key) => {
                message += `${key}: ${value}`;
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
    let message: string = "Information \n";
    for (const key in bayes)
        if (bayes.hasOwnProperty(key))
            message += `${key.slice(0, -1)}: ${bayes[key as keyof Bayes]}% \n`;

    return message;
}