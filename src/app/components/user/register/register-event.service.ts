import {EventEmitter, Injectable} from "@angular/core";
import {UserReq} from "../../../services/swagger";

@Injectable()
export class RegisterEventService {

    private userIdEmitter: EventEmitter<number> = new EventEmitter<number>();

    getUserIdEmitter() {
        return this.userIdEmitter;
    }

    sendIdUser(idUser: number) {
        this.userIdEmitter.emit(idUser);
    }

    freshUser?: UserReq;

    setNewLogin(newUser: UserReq) {
        this.freshUser = newUser;
    }
}
