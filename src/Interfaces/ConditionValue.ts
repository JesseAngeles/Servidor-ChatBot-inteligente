import { Condition } from "./Condition";

export interface ConditionValue {
    condition: Condition;
    indexExpected: number;
    indexValue: number;
}