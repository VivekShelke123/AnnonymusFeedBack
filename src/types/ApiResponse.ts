import {Message} from "../model/User";

export interface ApiResponse {
    success : boolean;
    message: string;
    isAcceptinMessages? : boolean;
    messages? : Array<Message>;
}