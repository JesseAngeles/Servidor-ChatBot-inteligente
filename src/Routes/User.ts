import { Router } from "express";
import { add, drop, getAll, getUser, test, update } from "../Controllers/User";

const routerUser = Router();

routerUser.post('', add);
routerUser.get('', getAll);
routerUser.get('/:id', getUser);
routerUser.put('/:id', update);
routerUser.delete('/:id', drop);
routerUser.patch('/test/', test);

export default routerUser;