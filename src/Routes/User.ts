import { Router } from "express";
import { add, drop, getAll, getUser, update } from "../Controllers/User";

const routerUser = Router();

routerUser.post('', add);
routerUser.get('', getAll);
routerUser.get('/:id', getUser);
routerUser.put('/:id', update);
routerUser.delete('/:id', drop);

export default routerUser;