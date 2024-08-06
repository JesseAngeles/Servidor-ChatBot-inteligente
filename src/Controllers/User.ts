import { Request, Response } from "express";
import users from "../Models/User";
import { testMessage } from "../Middlewares/Bayes";
import { idValidation, nameValidation, phoneValidation, emailValidation } from "../Middlewares/FieldValidation";
import { createSelect } from "../Middlewares/Functions";

const availableFields = { _id: true, name: true, phone: true, email: true };

// Crear nuevo usuario 
export const add = async (req: Request, res: Response) => {
    try {
        const { name, phone, email, fields } = req.body

        if (!nameValidation(name) || !phoneValidation(phone) || emailValidation(email))
            return res.status(400).send('Missing required fields');

        const newUser = new users({ name, phone, email });
        const addUser = await newUser.save();
        const returnUser = await users.findById(addUser._id)
            .select(createSelect(fields, availableFields));

        return res.status(200).json(returnUser);
    } catch (error) {
        console.error(`Error (Controllers/user/add): ${error}`);
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
        console.error(`Error (Controllers/user/getAll): ${error}`);
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
            return res.status(404).send('User not found');

        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error (Controllers/user/getUser): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

// Actualizar la información por ID
export const update = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;
        const { name, phone, email, fields } = req.body;

        if (!idValidation(id))
            return res.status(400).send('Missing required fields');

        const user = await users.findById(id).select(availableFields);
        if (!user)
            return res.status(404).send("User not found");

        if (nameValidation(name)) user.name = name;
        if (phoneValidation(phone)) user.phone = phone;
        if (emailValidation(email)) user.email = email;

        const updateUser = await user.save();
        const returnUser = await users.findById(updateUser._id)
            .select(createSelect(fields, availableFields));

        return res.status(200).json(returnUser);
    } catch (error) {
        console.error(`Error (Controllers/user/update): ${error}`);
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
        if (!user) return res.status(404).send("User not found");

        await users.findByIdAndDelete(id)
            .select(createSelect(fields, availableFields));
        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error (Controllers/user/drop): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//! Probar mensaje
export const test = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        const bayesTest = testMessage(message);
        return res.status(200).json(bayesTest);
    } catch (error) {
        console.log("Error", error);
        return res.status(500).send('Error en prueba test: ' + error);
    }
}