import { NextState } from './../Interfaces/NextState';
import { Request, Response } from "express";
import { idValidation } from "../Middlewares/FieldValidation";
import accounts from "../Models/Account";
import { setConditionValue, updateNextStates } from "../Middlewares/Functions";

//todo prueba update nextStates
export const testUpdate = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!idValidation(id))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(id);
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

//TODO prueba update condition values
export const updateConditionValue = async (req: Request, res: Response) => {
    try {
        const { idAccount, idCondition } = req.params;
        const indexValue: string = req.body.indexValue;

        if (!idValidation(idAccount) || idValidation(idCondition))
            return res.status(400).send('Missing required fields');

        const account = await accounts.findById(idAccount);
        if(!account)
            return res.status(404).send(`Can´t find account by ID`);

        setConditionValue(account.nextStates, idCondition, indexValue);

    } catch (error) {
        console.log(`Error (Controllers/account/updateConditionValue)`);
        console.log(error);
        return res.status(500).send(`Server errro: ${error}`);
    }
}

//TODO funcion para obtener todos los estados disponibles


//TODO función para cambiar de estados
