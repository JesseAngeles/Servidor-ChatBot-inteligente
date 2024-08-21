import { Router } from "express";
import { changeState, getAvailableStates, resetConversationFlow, setNextStates, updateConditionValue } from "../Controllers/NextStates";

const routerNextStates = Router();

routerNextStates.get('/:idUser/:idAccount', getAll);
routerNextStates.put('/:idUser/:idAccount', setNextStates);
routerNextStates.put('/:idUser/:idAccount/conditions', updateConditionValue);
routerNextStates.get("/:idUser/:idAccount/states", getAvailableStates);
routerNextStates.put("/:idUser/:idAccount/state/:idState", changeState);
routerNextStates.patch("/:idUser/:idAccount/reset", resetConversationFlow);

export default routerNextStates;