import { Request, Response } from "express";
import accounts from "../Models/Account";
import { createSelect, initConversationFlow, updateNextStates } from "../Middlewares/Functions";
import { NextState } from "../Interfaces/NextState";
import { contextValidation, idValidation, nameValidation } from "../Middlewares/FieldValidation";

const availableFields = {name: true, context: true, currentState: true, nextStates: true};

// Crear una nueva cuenta
export const add = async (req: Request, res: Response) => {
    try {
        const { name, context, fields } = req.body;
        const [conversationFlow, currentState] = initConversationFlow();
        const nextStates:NextState[] = [];

        if (!nameValidation(name) || !contextValidation(context))
            return res.status(400).send('Missing required fields');

        const newAccount = new accounts({ name, context, conversationFlow, currentState, nextStates });
        const addAccount = await newAccount.save();
        const returnAccount = await accounts.findById(addAccount._id)
            .select(createSelect(fields, availableFields));

        return res.status(200).json(returnAccount);
    } catch (error) {
        console.error(`Error (Controllers/account/add)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Consultar todas las cuentas
export const getAll = async (req: Request, res: Response) => {
    try {
        const fields = req.body.fields;

        const allAccounts = await accounts.find()
            .select(createSelect(fields, availableFields));

        console.log(createSelect(fields, availableFields));

        return res.status(200).json(allAccounts);
    } catch (error) {
        console.error(`Error (Controllers/account/getAll):`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Consultar cuenta por ID
export const getAccount = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const fields = req.body.fields;

        if (!idValidation(id))
            return res.status(400).send('Missing required fields');

        const account = await accounts.findById(id)
            .select(createSelect(fields, availableFields));
        if (!account)
            return res.status(404).send('Account not found');

        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/getAccount)`);
        console.log(error);        
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Actualizar la información por ID
export const update = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const {name, context} = req.body;
        const fields = req.body.fields;

        if (!idValidation(id))
            return res.status(400).send('Missing required fields');

        const account = await accounts.findById(id).select(availableFields);
        if (!account) return res.status(404).send("Account not found");

        if (nameValidation(name)) account.name = name;
        if (contextValidation(context)) account.context = context;

        const updatedAccount = await account.save();
        const returnAccount = await accounts.findById(updatedAccount._id)
            .select(createSelect(fields, availableFields));

        return res.status(200).json(returnAccount);
    } catch (error) {
        console.error(`Error (Controllers/account/update)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Eliminar información por ID
export const drop = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const fields = req.body.fields;

        if (!idValidation(id)) return res.status(400).send('Missing required fields');

        const account = await accounts.findById(id);
        if (!account)
            return res.status(404).send("Account not found");

        await accounts.findByIdAndDelete(id)
            .select(createSelect(fields, availableFields));

        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/drop)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//todo prueba update nextStates
export const testUpdate = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!idValidation(id)) 
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(id);
        if (!account)
            return res.status(404).send(`Can´t find account by ID`);

        account.nextStates = updateNextStates(account.currentState, account.conversationFlow.transitions);
        //todo falta actualizar la base de datos
        return res.status(200).json(account.nextStates);
    } catch (error) {
        console.log(`Error (Controllers/account/testUpdate)`);
        console.log(error);
        return res.status(500).send(`Server errro: ${error}`);
    }
}