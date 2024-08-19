import { Prompt } from "./Prompt";

export interface State {
    _id: any;
    name: string;
    description: string;
    prompts: Prompt[] | null;
}