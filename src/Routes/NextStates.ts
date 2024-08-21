import { Router } from "express";
import { changeState, getAll, getAvailableStates, resetConversationFlow, updateConditionValue } from "../Controllers/NextStates";

const routerNextStates = Router();

routerNextStates.get('/:idUser/:idAccount', getAll);
routerNextStates.get('/:idUser/:idAccount/available', getAvailableStates);
routerNextStates.put('/:idUser/:idAccount/condition', updateConditionValue);
routerNextStates.put('/:idUser/:idAccount/state', changeState);
routerNextStates.patch('/:idUser/:idAccount', resetConversationFlow);

export default routerNextStates;