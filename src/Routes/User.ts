import { Router } from "express";
import { add, drop, getAll, getById, update } from "../Controllers/User";

const routerUser = Router();

routerUser.post('', add);           //name, aditionalInformation
routerUser.get('', getAll);         
routerUser.get('/:id', getById);
routerUser.put('/:id', update);     //name, aditionalInformation
routerUser.delete('/:id', drop);

export default routerUser;