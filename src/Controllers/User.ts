import { Request, Response } from "express";
import users from "../Models/User";
import { createSelectString, phoneValidation } from "./Validation";
import { testMessage } from "./Bayes";

const availableFields = { _id: true, name: true, phone: true };
const defaultSelectString = '_id name phone';

//* Crear nuevo usuario 
export const add = async (req: Request, res: Response) => {
    try {
        const { name, phone } = req.body;
        if (!name || !phone) return res.status(400).send('Missing required fields');
        if (!phoneValidation(phone)) return res.status(400).send('Invalid phone format');

        const newUser = new users({ name, phone });
        const addUser = await newUser.save();
        const userReturn = await users.findById(addUser._id).select(defaultSelectString);

        return res.status(201).json(userReturn);
    } catch (error) {
        console.error(`Error (Controllers/user/add): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//* Consultar todos los usuarios
export const getAll = async (req: Request, res: Response) => {
    try {
        const fields = req.body.fields;
        const select = createSelectString(fields, availableFields, defaultSelectString);

        const allUsers = await users.find().select(select);
        return res.status(200).json(allUsers);
    } catch (error) {
        console.error(`Error (Controllers/user/getAll): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//* Consulta usuario por Id
export const getUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).send('Missing required fields');

        const fields = req.body.fields;
        const select = createSelectString(fields, availableFields, defaultSelectString);

        const user = await users.findById(id).select(select);
        if (!user) return res.status(404).send('User not found');

        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error (Controllers/user/getUser): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//* Actualizar la información por ID
export const update = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).send('Missing required fields');

        const user = await users.findById(id).select(defaultSelectString);
        if (!user) return res.status(404).send("User not found");

        const { name, phone } = req.body;
        if (name) user.name = name;
        if (phone) {
            if (!phoneValidation(phone)) return res.status(400).send('Invalid phone format');
            user.phone = phone;
        }

        await user.save();
        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error (Controllers/user/update): ${error}`);
        return res.status(500).send(`Server error: ${error}`);
    }
}

//* Eliminar información por ID
export const drop = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).send('Missing required fields');

        const user = await users.findById(id);
        if (!user) return res.status(404).send("User not found");

        await users.findByIdAndDelete(id);
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