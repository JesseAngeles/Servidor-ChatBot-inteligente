export interface Condition {
    _id: any;
    name: string;
    values: any[];
}

export interface State {
    _id: any;
    name: string;
    description: string;
}

export interface Transition {
    _id: any;
    exit: State;
    arrival: State;
    conditions: [Condition, number][][] | null;
}

export interface ConversationFlow {
    conditions: Condition[];
    states: State[];
    transitions: Transition[];
}