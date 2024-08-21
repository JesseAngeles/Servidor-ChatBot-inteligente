import { Request, Response } from "express";
import users from "../Models/User";
import { idValidation, nameValidation, aditionalInformationValidation } from "../Middlewares/FieldValidation";
import { createSelect } from "../Middlewares/Functions";

const availableFields = { _id: true, name: true, information: true};

// Crear nuevo usuario 
export const add = async (req: Request, res: Response) => {
    try {
        const { name, aditionalInformation, fields } = req.body;
        const information = aditionalInformationValidation(aditionalInformation);

        if (!nameValidation(name))
            return res.status(400).send('Missing required fields');

        const newUser = new users({ name, information });
        const addUser = await newUser.save();
        const returnUser = await users.findById(addUser._id)
            .select(createSelect(fields, availableFields));
        return res.status(200).json(returnUser);
    } catch (error) {
        console.error(`Error (Controllers/user/add)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Consultar todos los usuarios
export const getAll = async (req: Request, res: Response) => {
    try {
        const fields = req.body.fields;

        const allUsers = await users.find()
            .select(createSelect(fields, availableFields));

        return res.status(200).json(allUsers);
    } catch (error) {
        console.error(`Error (Controllers/user/getAll)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Consulta usuario por Id
export const getUser = async (req: Request, res: Response) => {
    try {
        const id: String = req.params.id;
        const fields = req.body.fields;

        if (!idValidation)
            return res.status(400).send('Missing required fields');

        const user = await users.findById(id)
            .select(createSelect(fields, availableFields));

        if (!user)
            return res.status(404).send('Can´t find User by Id');

        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error (Controllers/user/getUser)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Actualizar la información por ID
export const update = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;
        const { name, aditionalInformation, fields } = req.body;

        if (!idValidation(id))
            return res.status(400).send('Missing required fields');

        const user = await users.findById(id).select(availableFields);
        if (!user)
            return res.status(404).send("Can´t find User by Id");

        if (nameValidation(name)) user.name = name;
        const information = aditionalInformationValidation(aditionalInformation);
        if(information) user.information = information;

        const updateUser = await user.save();
        const returnUser = await users.findById(updateUser._id)
            .select(createSelect(fields, availableFields));

        return res.status(200).json(returnUser);
    } catch (error) {
        console.error(`Error (Controllers/user/update)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Eliminar información por ID
export const drop = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;
        const fields = req.body.fields;

        if (!idValidation(id))
            return res.status(400).send('Missing required fields');

        const user = await users.findById(id);
        if (!user) return res.status(404).send("CAn´t find User by Id");

        await users.findByIdAndDelete(id)
            .select(createSelect(fields, availableFields));
        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error (Controllers/user/drop)`);
        console.log(error);
        return res.status(500).send(`Server error: ${error}`);
    }
}