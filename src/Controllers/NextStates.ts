import { NextState } from './../Interfaces/NextState';
import { Request, Response } from "express";
import { idValidation } from "../Middlewares/FieldValidation";
import accounts from "../Models/Account";
import { availableStates, setConditionValue, updateNextStates } from "../Middlewares/Functions";

// Prueba de la función que establece los siguientes estados
//TODO BORRAR
export const setNextStates = async (req: Request, res: Response) => {
    try {
        const idAccount = req.params.idAccount;

        if (!idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(idAccount);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);


        //* actualizar información
        account.nextStates = updateNextStates(account.currentState, account.conversationFlow.transitions);
        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.nextStates);
    } catch (error) {
        console.log(`Error (Controllers/account/testUpdate)`);
        console.log(error);
        return res.status(500).send(`Server errro: ${error}`);
    }
}

// Actualiza el valor del indice de la condicion
//TODO PRUEBAS
export const updateConditionValue = async (req: Request, res: Response) => {
    try {
        const { idAccount, idCondition } = req.params;
        const indexValue: number = req.body.indexValue;

        if (!idValidation(idAccount) || !idValidation(idCondition))
            return res.status(400).send('Missing required fields');

        const account = await accounts.findById(idAccount);
        if(!account)
            return res.status(404).send(`Can´t find account by ID`);        

        account.nextStates = setConditionValue(account.nextStates, idCondition, indexValue);

        const updatedAccount = await account.save();
        return res.status(200).json(updatedAccount.nextStates);
    } catch (error) {
        console.log(`Error (Controllers/account/updateConditionValue)`);
        console.log(error);
        return res.status(500).send(`Server errro: ${error}`);
    }
}

//TODO funcion para obtener todos los estados disponibles
export const getAvailableStates = async (req: Request, res: Response) => {
    try {
        const idAccount: string = req.params.idAccount;

        if (!idValidation(idAccount))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(idAccount);
        if(!account)
            return res.status(404).send(`Can´t find account by ID`);

        const nextStates: NextState[] = availableStates(account.nextStates);
        
        return res.status(200).send(nextStates);
    } catch (error) {
        console.log(`Error (Controllers/nextState/getAvailableStates)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//TODO función para cambiar de estados
export const changeState = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        console.log(`Error (Controllers/nextState/changeState)`);
        console.log(error);
        return res.status(500).send(`Server errror: ${error}`);
    }
}
