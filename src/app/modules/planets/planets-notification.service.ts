import {EventEmitter, Injectable} from "@angular/core";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class PlanetsNotificationService {

    private emitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {
    }

    public push() {
        this.emitter.emit(true);
    }

    public ask() {
        return this.emitter;
    }
}
