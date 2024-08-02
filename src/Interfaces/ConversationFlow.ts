import { Condition } from "./Condition";
import { State } from "./State";
import { Transition } from "./Transition";

export interface ConversationFlow {
    conditions: Condition[];
    states: State[];
    transitions: Transition[];
}