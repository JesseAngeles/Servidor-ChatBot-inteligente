import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './DatabaseConnection';

import { processCSV } from './Middlewares/Bayes';

//TODO importar rutas
import routerUser from './Routes/User';
import routerAccount from './Routes/Account';
import routerConversationFlow from './Routes/ConversationFlow';
import routerNextStates from './Routes/NextStates';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 8080;

// Arreglo para almacenar los datos del CSV
let bayesData: any[] = [];

export function getBayesData(): any[] { return bayesData; }

// Cargar los datos del CSV al iniciar el servidor
processCSV("src/Resources/model.csv")
    .then((data) => {
        bayesData = data;
        console.log("CSV data loaded successfully");
    })
    .catch((error) => {
        console.error("Error loading CSV data:", error);
    });

// Middleware
app.use(express.json());
app.use(cors());

//TODO Rutas
app.use('/user', routerUser);
app.use('/account', routerAccount);
app.use('/conversationFlow', routerConversationFlow);
app.use('/nextStates', routerNextStates);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server active on port: ${port}`);
});