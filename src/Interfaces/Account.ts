export interface Condition {
    name: string;
    values: any[];
}

export interface State {
    name: string;
    description: string;
}

export interface Transition {
    exit: State;
    arrival: State;
    condition: [Condition, number] | null;
}

export interface ConversationFlow {
    conditions: Condition[];
    states: State[];
    transitions: Transition[];
}

export interface Account {
    name: string;
    campaign: string;
    context: string;
    phone: string;
    conversationFlow: ConversationFlow;
}