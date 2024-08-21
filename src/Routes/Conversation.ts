import { Router } from "express";
import { drop, getAll, getConversation, setConversationWith } from "../Controllers/Conversation";

const routerConversation = Router();

routerConversation.post('/:idUser/account/:idAccount', setConversationWith);
routerConversation.get('/idUser/account/:idAccount', getConversation);
routerConversation.get('/:idUser', getAll);
routerConversation.delete('/:idUser/account/:idAccount', drop);

export default routerConversation;