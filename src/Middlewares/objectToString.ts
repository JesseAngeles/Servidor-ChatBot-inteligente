import { Account } from "../Interfaces/Account";
import { Bayes } from "../Interfaces/Bayes";
import { User } from "../Interfaces/User";

export function userToString(user: User): string {
    let message: string = `Information: \n`;
    message += `name: ${user.name}, `;
    
    user.information?.forEach((info, index) => {
        Object.entries(info).forEach(([key, value], entryIndex) => {
            message += `${key} : ${value}`;
            message += (entryIndex < Object.entries(info).length - 1 ? ',' : '.');
        })
    })
    
    return message;
}

export function accountToString(account: Account): string {
    let message: string = `Information: \n`;
    message += `name: ${account.name}, `;
    message += `context: ${account.context}, `;
    return message;
}

export function bayesToString(bayes: Bayes): string {
    let message: string = "Information \n";
    for (const key in bayes) 
        if (bayes.hasOwnProperty(key)) 
            message += `${key.slice(0, -1)}: ${bayes[key as keyof Bayes]}% \n`;

    return message;
}