export interface Prompt {
    message: string;
    variables: { [key: string]: string }[];
}