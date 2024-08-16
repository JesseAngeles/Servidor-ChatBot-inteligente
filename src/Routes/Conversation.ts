import { Router } from "express";
import { drop, getAll, getConversation } from "../Controllers/Conversation";

const routerConversation = Router();

routerConversation.get('/:idUser', getAll);
routerConversation.get('/idUser/account/:idAccount', getConversation);
routerConversation.delete('/:idUser/account/:idAccount', drop);

export default routerConversation;