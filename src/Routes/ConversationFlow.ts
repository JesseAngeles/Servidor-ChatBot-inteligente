import { Router } from "express";
import { addConstraints, setTransition, getConversation } from "../Controllers/ConversationFlow";

const routerConversationFlow = Router();

routerConversationFlow.post('/constraints/:id', addConstraints);
routerConversationFlow.post('/transition/:id', setTransition);
routerConversationFlow.get('/:id', getConversation);

export default routerConversationFlow;