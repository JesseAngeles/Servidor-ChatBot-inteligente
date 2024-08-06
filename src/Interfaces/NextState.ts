import { ConditionValue } from "./ConditionValue";
import { State } from "./State";

export interface NextState {
    state: State;
    conditions: ConditionValue[][] | null;
    available: boolean;
}