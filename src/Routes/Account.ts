import { Router } from "express";
import { add, drop, getAccount, getAll, update, testUpdate } from "../Controllers/Account";

const routerAccount = Router();

routerAccount.post('', add);
routerAccount.get('', getAll);
routerAccount.get('/:id', getAccount);
routerAccount.put('/:id', update);
routerAccount.delete('/:id', drop);

routerAccount.patch('/:id/test', testUpdate);

export default routerAccount;
