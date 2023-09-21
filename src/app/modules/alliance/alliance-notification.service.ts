import {EventEmitter, Injectable} from "@angular/core";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class AllianceNotificationService {

    private allyCreatedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {
    }

    public pushCreation() {
        this.allyCreatedEmitter.emit(true);
    }

    public askCreation() {
        return this.allyCreatedEmitter;
    }
}
