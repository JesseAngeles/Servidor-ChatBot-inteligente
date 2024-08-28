import { Request, Response } from "express";
import users from "../Models/User";
import { idValidation, nameValidation, additionalInformationValidation } from "../Middlewares/FieldValidation";

const availableFields = { _id: true, name: true, information: true };

// Create new User
export const add = async (req: Request, res: Response) => {
    try {
        const { name, aditionalInformation } = req.body;
        const information = additionalInformationValidation(aditionalInformation);

        if (!nameValidation(name))
            return res.status(400).send('Missing required fields');

        const user = new users({ name, information });
        const savedUser = await user.save();
        const returnUser = await users.findById(savedUser._id).select(availableFields);
        return res.status(200).json(returnUser);
    } catch (error) {
        console.error(`Error (Controllers/user/add)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Get all users
export const getAll = async (req: Request, res: Response) => {
    try {
        const allUsers = await users.find().select(availableFields);

        return res.status(200).json(allUsers);
    } catch (error) {
        console.error(`Error (Controllers/user/getAll)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Get user by id
export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!idValidation)
            return res.status(400).send('Missing required fields');

        const user = await users.findById(id).select(availableFields);

        if (!user)
            return res.status(404).send('Can´t find User by Id');

        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error (Controllers/user/getUser)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Update user information by Id
export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, aditionalInformation } = req.body;

        if (!idValidation(id))
            return res.status(400).send('Missing required fields');

        const user = await users.findById(id).select(availableFields);
        if (!user)
            return res.status(404).send("Can´t find User by Id");

        if (nameValidation(name)) user.name = name;
        const information = additionalInformationValidation(aditionalInformation);
        if (information.length > 0) user.information = information;

        const updateUser = await user.save();
        const returnUser = await users.findById(updateUser._id).select(availableFields);

        return res.status(200).json(returnUser);
    } catch (error) {
        console.error(`Error (Controllers/user/update)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Delete inforamtion by id
export const drop = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!idValidation(id))
            return res.status(400).send('Missing required fields');

        const user = await users.findByIdAndDelete(id).select(availableFields);
        if (!user)
            return res.status(404).send("CAn´t find User by Id");

        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error (Controllers/user/drop)`, error);
        return res.status(500).send(`Server error: ${error}`);
    }
}