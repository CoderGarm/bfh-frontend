import {EventEmitter, Injectable} from "@angular/core";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class PlanetsNotificationService {

    private emitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {
    }

    /**
     * Tell the others that some kind of construction was started.
     */
    public push() {
        this.emitter.emit(true);
    }

    /**
     * Ask if you are interested if some construction was started.
     */
    public ask() {
        return this.emitter;
    }
}
