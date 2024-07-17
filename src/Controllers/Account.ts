import { Request, Response } from "express";
import accounts from "../Models/Account";
import { createSelectString, phoneValidation } from "./Validation";

const availableFields = { _id: true, name: true, context: true, campaign: true, phone: true};
const defaultSelectString = "_id name campaign phone";

//* Crear una nueva cuenta
export const add = async (req: Request, res: Response) => {
    try {
        const { name, context, campaign, phone } = req.body;
        const conversationFlow = Object(null);
        
        if (!name || !phone) return res.status(400).send('Missing required fields');
        if (!phoneValidation(phone)) return res.status(400).send('Invalid phone format');

        const newAccount = new accounts({ name, context, campaign, phone, conversationFlow });
        const addAccount = await newAccount.save();
        const accountReturn = await accounts.findById(addAccount._id).select(defaultSelectString);

        return res.status(201).json(accountReturn);
    } catch (error) {
        console.error(`Error (Controllers/account/add): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//* Consultar todas las cuentas
export const getAll = async(req:Request, res: Response) => {
    try {
        const fields = req.body.fields;
        const select = createSelectString(fields, availableFields, defaultSelectString);

        const allAccounts = await accounts.find().select(select);
        return res.status(200).json(allAccounts);
    } catch (error) {
        console.error(`Error (Controllers/account/getAll): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//* Consultar cuenta por ID
export const getAccount = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).send('Missing required fields');
    
        const fields = req.body.fields;
        const select = createSelectString(fields, availableFields, defaultSelectString);

        const account = await accounts.findById(id).select(select);
        if (!account) return res.status(404).send('Account not found');

        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/getAccount): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//* Actualizar la información por ID
export const update = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).send('Missing required fields');
        
        const account = await accounts.findById(id).select(defaultSelectString);
        if (!account) return res.status(404).send("Account not found");

        const { name, context, campaign, phone } = req.body;
        if (name) account.name = name;
        if(context) account.context = context;
        if(campaign) account.campaign = campaign;
        if (phone) {
            if (!phoneValidation(phone)) return res.status(400).send('Invalid phone format');
            account.phone = phone;
        }

        await account.save();
        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/update): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//* Eliminar información por ID
export const drop = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).send('Missing required fields');

        const account = await accounts.findById(id);
        if (!account) return res.status(404).send("Account not found");

        await accounts.findByIdAndDelete(id);
        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/drop): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}