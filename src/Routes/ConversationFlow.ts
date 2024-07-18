import { Router } from "express";
import { addConstraints, setTransitions, getConversation } from "../Controllers/ConversationFlow";

const routerConversationFlow = Router();

routerConversationFlow.post('/constraints/:id', addConstraints);
routerConversationFlow.post('/transitions/:id', setTransitions);
routerConversationFlow.get('/:id', getConversation);

export default routerConversationFlow;