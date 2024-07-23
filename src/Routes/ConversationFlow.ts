import { Router } from "express";
import { addConstraints, setTransition, getConversation, updateCondition, updateState, deleteCondition, deleteState, deleteTransition } from "../Controllers/ConversationFlow";

const routerConversationFlow = Router();

routerConversationFlow.get('/:id', getConversation);
routerConversationFlow.post('/:idAccount/constraints', addConstraints);
routerConversationFlow.post('/:idAccount/transition', setTransition);
routerConversationFlow.put('/:idAccount/condition/:idCondition', updateCondition);
routerConversationFlow.put('/:idAccount/state/:idState', updateState);
routerConversationFlow.delete('/:idAccount/condition/:idCondition', deleteCondition);
routerConversationFlow.delete('/:idAccount/state/:idState', deleteState);
routerConversationFlow.delete('/:idAccount/transition/:idTransition', deleteTransition);

export default routerConversationFlow;