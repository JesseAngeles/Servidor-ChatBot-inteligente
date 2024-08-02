import { ConditionValue } from "./ConditionValue";
import { State } from "./State";

export interface Transition {
    exitState: State;
    arrivalState: State;
    conditions: ConditionValue[][] | null;
}