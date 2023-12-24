import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class RegisterEventService {

    private userIdEmitter: EventEmitter<number> = new EventEmitter<number>();

    getUserIdEmitter() {
        return this.userIdEmitter;
    }

    sendIdUser(idUser: number) {
        this.userIdEmitter.emit(idUser);
    }
}
