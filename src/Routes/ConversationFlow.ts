import { Router } from "express";
import { addConstraints, setTransitions, getConversation, updateCondition, updateState, deleteCondition, deleteState, deleteTransition } from "../Controllers/ConversationFlow";

const routerConversationFlow = Router();

routerConversationFlow.get('/:id', getConversation);
routerConversationFlow.post('/:idAccount/constraints', addConstraints);                     // conditions, states
routerConversationFlow.post('/:idAccount/transitions', setTransitions);                     // idExit, idArrival, conditions
routerConversationFlow.put('/:idAccount/condition/:idCondition', updateCondition);          // name, values
routerConversationFlow.put('/:idAccount/state/:idState', updateState);                      // name, description
routerConversationFlow.delete('/:idAccount/condition/:idCondition', deleteCondition);       
routerConversationFlow.delete('/:idAccount/state/:idState', deleteState);
routerConversationFlow.delete('/:idAccount/transition/:idTransition', deleteTransition);

export default routerConversationFlow;