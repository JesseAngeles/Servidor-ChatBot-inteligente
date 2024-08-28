import { Router } from "express";
import { changeState, getAll, availableStates, resetConversationFlow, updateConditionValue } from "../Controllers/NextStates";

const routerNextStates = Router();

routerNextStates.get('/:idUser/:idAccount', getAll);
routerNextStates.get('/:idUser/:idAccount/available', availableStates);
routerNextStates.put('/:idUser/:idAccount', updateConditionValue);
routerNextStates.put('/:idUser/:idAccount/state/:idState', changeState);
routerNextStates.patch('/:idUser/:idAccount', resetConversationFlow);

export default routerNextStates;