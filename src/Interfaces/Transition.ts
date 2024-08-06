import { ConditionValue } from "./ConditionValue";
import { State } from "./State";

export interface Transition {
    _id: any;
    exitState: State;
    arrivalState: State;
    conditions: ConditionValue[][] | null;
}