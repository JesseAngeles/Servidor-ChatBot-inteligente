import { Request, Response } from "express";
import accounts from "../Models/Account";
import { createSelectString } from "./Validation";
import { idValidation, nameValidation, phoneValidation } from "../Middlewares/FieldValidation";

const availableFields = { _id: true, name: true, context: true, campaign: true, phone: true };
const defaultSelectString = "_id name campaign phone";

// Crear una nueva cuenta
export const add = async (req: Request, res: Response) => {
    try {
        const { name, context, campaign, phone, fields } = req.body;
        const conversationFlow = Object(null);

        if (!nameValidation(name) || !phoneValidation(phone))
            return res.status(400).send('Missing required fields');

        const newAccount = new accounts({ name, context, campaign, phone, conversationFlow });
        const addAccount = await newAccount.save();
        const returnAccount = await accounts.findById(addAccount._id)
            .select(createSelectString(fields, availableFields, defaultSelectString));

        return res.status(200).json(returnAccount);
    } catch (error) {
        console.error(`Error (Controllers/account/add): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Consultar todas las cuentas
export const getAll = async (req: Request, res: Response) => {
    try {
        const fields = req.body.fields;
        const select = createSelectString(fields, availableFields, defaultSelectString);

        const allAccounts = await accounts.find()
            .select(createSelectString(fields, availableFields, defaultSelectString));

        return res.status(200).json(allAccounts);
    } catch (error) {
        console.error(`Error (Controllers/account/getAll): ${error}`);
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
            .select(createSelectString(fields, availableFields, defaultSelectString));
        if (!account)
            return res.status(404).send('Account not found');

        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/getAccount): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Actualizar la información por ID
export const update = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const fields = req.body.fields;

        if (!idValidation(id))
            return res.status(400).send('Missing required fields');

        const account = await accounts.findById(id).select(defaultSelectString);
        if (!account) return res.status(404).send("Account not found");

        const { name, context, campaign, phone } = req.body;
        if (nameValidation(name)) account.name = name;
        if (context) account.context = context;
        if (campaign) account.campaign = campaign;
        if (phoneValidation(phone)) account.phone = phone;

        const updatedAccount = await account.save();
        const returnAccount = await accounts.findById(updatedAccount._id)
            .select(createSelectString(fields, availableFields, defaultSelectString));

        return res.status(200).json(returnAccount);
    } catch (error) {
        console.error(`Error (Controllers/account/update): ${error}`);
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
            .select(createSelectString(fields, availableFields, defaultSelectString));

        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/drop): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}