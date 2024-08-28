import { Request, Response } from "express";
import users from "../Models/User";
import accounts from "../Models/Account";
import { additionalInformationValidation, contextValidation, idValidation, nameValidation } from "../Middlewares/FieldValidation";
import { accountInUse, initConversationFlow } from "../Middlewares/Account";

const availableFields = { name: true, context: true, information: true };

// Create a new Account
export const add = async (req: Request, res: Response) => {
    try {
        const { name, context, additionalInformation } = req.body;

        if (!nameValidation(name) || !contextValidation(context))
            return res.status(400).send(`Missing required fields`);

        const conversationFlow = initConversationFlow();
        const information = additionalInformationValidation(additionalInformation);

        const newAccount = new accounts({ name, context, information, conversationFlow });
        const addAccount = await newAccount.save();
        const returnAccount = await accounts.findById(addAccount._id)
            .select(availableFields);

        return res.status(200).json(returnAccount);
    } catch (error) {
        console.error(`Error (Controllers/account/add)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Get all Accounts
export const getAll = async (req: Request, res: Response) => {
    try {
        const { fields } = req.body;

        let allAccounts;
        if (fields == `all`)
            allAccounts = await accounts.find();
        else
            allAccounts = await accounts.find().select(availableFields);

        return res.status(200).json(allAccounts);
    } catch (error) {
        console.error(`Error (Controllers/account/getAll):`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// get Account by Id
export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { fields } = req.body;

        if (!idValidation(id))
            return res.status(400).send(`Missing required fields`);

        let account;
        if (fields == `all`)
            account = await accounts.findById(id);
        else
            account = await accounts.findById(id).select(availableFields);

        if (!account)
            return res.status(404).send(`Can´t find Account by Id`);

        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/getAccount)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Update informatio by Id
export const update = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { name, context, additionalInformation } = req.body;

        if (!idValidation(id))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(id).select(availableFields);
        if (!account) return res.status(404).send(`Can´t find Account by Id`);

        const allUsers = await users.find();
        if (accountInUse(allUsers, account))
            return res.status(400).send(`Can´t update, Account already in Use`);

        if (nameValidation(name)) account.name = name;
        if (contextValidation(context)) account.context = context;
        const information = additionalInformationValidation(additionalInformation);
        if (information.length > 0) account.information = information;

        const updatedAccount = await account.save();
        const returnAccount = await accounts.findById(updatedAccount._id)
            .select(availableFields);

        return res.status(200).json(returnAccount);
    } catch (error) {
        console.error(`Error (Controllers/account/update)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Delete account information by Id
export const drop = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!idValidation(id))
            return res.status(400).send(`Missing required fields`);

        const account = await accounts.findById(id);
        if (!account)
            return res.status(404).send(`Can´t find Account by Id`);

        const allUsers = await users.find();
        if (accountInUse(allUsers, account))
            return res.status(400).send(`Can´t delete, Account already in Use`);

        await accounts.findByIdAndDelete(id)
            .select(availableFields);

        return res.status(200).json(account);
    } catch (error) {
        console.error(`Error (Controllers/account/drop)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}