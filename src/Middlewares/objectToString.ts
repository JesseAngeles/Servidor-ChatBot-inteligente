import { Account } from "../Interfaces/Account";
import { User } from "../Interfaces/User";

//TODO pruebas
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

// TODO pruebas
export function accountToString(account: Account): string {
    let message: string = `Information: \n`;
    message += `name: ${account.name}, `;
    message += `context: ${account.context}, `;
    return message;
}