import { Router } from "express";
import { add, drop, getById, getAll, update } from "../Controllers/Account";

const routerAccount = Router();

routerAccount.post('', add);                // name, context, aditionalInformation
routerAccount.get('', getAll);
routerAccount.get('/:id', getById);
routerAccount.put('/:id', update);
routerAccount.delete('/:id', drop);

export default routerAccount;
