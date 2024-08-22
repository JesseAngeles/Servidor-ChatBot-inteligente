import { Request, Response } from "express";
import users from "../Models/User";
import accounts from "../Models/Account";
import { createSelect } from "../Middlewares/Functions";
import { aditionalInformationValidation, contextValidation, idValidation, nameValidation } from "../Middlewares/FieldValidation";
import { accountInUse, initConversationFlow } from "../Middlewares/Account";

const availableFields = { name: true, context: true, information: true };

// Crear una nueva cuenta
export const add = async (req: Request, res: Response) => {
    try {
        const { name, context, aditionalInformation, fields } = req.body;
        const conversationFlow = initConversationFlow();
        const information = aditionalInformationValidation(aditionalInformation);


        if (!nameValidation(name) || !contextValidation(context))
            return res.status(400).send(`Missing required fields`);

        const newAccount = new accounts({ name, context, information, conversationFlow });
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

        let allAccounts;
        if (fields == `all`)
            allAccounts = await accounts.find();
        else
            allAccounts = await accounts.find()
                .select(createSelect(fields, availableFields));

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
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(id)
            .select(createSelect(fields, availableFields));
        if (!account)
            return res.status(404).send(`Can´t find Account by Id`);

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
        const { name, context, aditionalInformation } = req.body;
        const fields = req.body.fields;

        if (!idValidation(id))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(id).select(availableFields);
        if (!account) return res.status(404).send(`Can´t find Account by Id`);

        const allUsers = await users.find();
        if(accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);

        if (nameValidation(name)) account.name = name;
        if (contextValidation(context)) account.context = context;
        const information = aditionalInformationValidation(aditionalInformation);
        if(information.length > 0) account.information = information;

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

        if (!idValidation(id)) return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(id);
        if (!account)
            return res.status(404).send(`Can´t find Account by Id`);

        const allUsers = await users.find();
        if (accountInUse(allUsers, account))
            return res.status(400).send(`Can´t delete, Account already in Use`);

        await accounts.findByIdAndDelete(id)
            .select(createSelect(fields, availableFields));

        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/drop)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}