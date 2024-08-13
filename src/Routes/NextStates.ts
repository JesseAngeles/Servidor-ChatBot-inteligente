import { Router } from "express";
import { changeState, getAvailableStates, resetConversationFlow, setNextStates, updateConditionValue } from "../Controllers/NextStates";

const routerNextStates = Router();

routerNextStates.put('/:idAccount', setNextStates);
routerNextStates.put('/:idAccount/conditions', updateConditionValue);
routerNextStates.get("/:idAccount/states", getAvailableStates);
routerNextStates.put("/:idAccount/state/:idState", changeState);
routerNextStates.patch("/:idAccount/reset", resetConversationFlow);

export default routerNextStates;