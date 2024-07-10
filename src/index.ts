import express from 'express';
import connectDB from './DatabaseConnection';
import cors from 'cors';    //* Permite conectarse desde diferentes tecnologias
import dotenv from 'dotenv';
//TODO Añadir rutas
import routerUser from './Routes/User';
import routerAccount from './Routes/Character';

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

//TODO definición de rutas
app.use('/user', routerUser);
app.use('/account', routerAccount);

app.listen(port, () => {
    console.log(`Server active un port: ${port}`);
});