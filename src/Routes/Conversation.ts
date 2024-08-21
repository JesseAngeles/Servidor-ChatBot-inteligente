import { Router } from "express";
import { drop, getAll, getConversation, setConversationWith } from "../Controllers/Conversation";

const routerConversation = Router();

routerConversation.post('/:idUser/:idAccount', setConversationWith);
routerConversation.get('/idUser/:idAccount', getConversation);
routerConversation.get('/:idUser', getAll);
routerConversation.delete('/:idUser/:idAccount', drop);

export default routerConversation;