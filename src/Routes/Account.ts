import { Router } from "express";
import { add, drop, getAccount, getAll, update } from "../Controllers/Account";

const routerAccount = Router();

routerAccount.post('', add);                // name, context, aditionalInformation
routerAccount.get('', getAll);
routerAccount.get('/:id', getAccount);
routerAccount.put('/:id', update);
routerAccount.delete('/:id', drop);

export default routerAccount;
