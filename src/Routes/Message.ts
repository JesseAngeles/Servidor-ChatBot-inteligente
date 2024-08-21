import { Router } from "express";
import { history, newSystemMessage, newUserMessage } from "../Controllers/Message";

const routerMessage = Router();

routerMessage.get('/:idUser/:idAccount/history', history);
routerMessage.post('/:idUser/:idAccount/user', newUserMessage);
routerMessage.post('/:idUser/:idAccount/system',  newSystemMessage);

export default routerMessage;