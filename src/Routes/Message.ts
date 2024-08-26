import { Router } from "express";
import { history, newSystemMessage, newUserMessage } from "../Controllers/Message";

const routerMessage = Router();

routerMessage.get('/:idUser/:idAccount', history);
routerMessage.post('/:idUser/:idAccount/user', newUserMessage);             // content
routerMessage.post('/:idUser/:idAccount/system',  newSystemMessage);        // content

export default routerMessage;