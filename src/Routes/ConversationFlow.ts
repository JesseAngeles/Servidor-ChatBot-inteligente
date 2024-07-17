import { Router } from "express";
import { addConstraints } from "../Controllers/ConversationFlow";

const routerConversationFlow = Router();

routerConversationFlow.post('/:id', addConstraints);

export default routerConversationFlow;