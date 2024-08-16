import { Bayes } from "./Bayes";

export interface Message {
    from: "system" | "assistant" | "user";
    content: string;
    feelings: Bayes;
}