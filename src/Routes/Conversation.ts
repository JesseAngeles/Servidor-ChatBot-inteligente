import { Router } from "express";
import { drop, getAll, getConversation, setConversationWith } from "../Controllers/Conversation";

const routerConversation = Router();

routerConversation.post('/:idUser/:idAccount', setConversationWith);
routerConversation.get('/:idUser', getAll);
routerConversation.get('/:idUser/:idAccount', getConversation);
routerConversation.delete('/:idUser/:idAccount', drop);

export default routerConversation;