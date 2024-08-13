import { Router } from "express";
import { getAvailableStates, setNextStates, updateConditionValue } from "../Controllers/NextStates";

const routerNextStates = Router();

routerNextStates.put('/:idAccount', setNextStates);
routerNextStates.put('/:idAccount/condition/:idCondition', updateConditionValue);
routerNextStates.get("/:idAccount/availableStates", getAvailableStates);

export default routerNextStates;