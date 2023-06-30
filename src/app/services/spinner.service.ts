import {EventEmitter, Injectable} from '@angular/core';

/**
 * Displays the spinner with or without a message.
 */
@Injectable()
export class SpinnerService {

    private displaySpinnerEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
    private spinnerMessageEmitter: EventEmitter<string> = new EventEmitter<string>();

    constructor() {
    }

    activateSpinner(spinnerMessage?: string) { /* fixme spinner didnt work? */
        this.displaySpinnerEmitter.emit(true);
        if (!!spinnerMessage) {
            this.spinnerMessageEmitter.emit(spinnerMessage);
        }
    }

    deactivateSpinner() {
        this.displaySpinnerEmitter.emit(false);
        this.spinnerMessageEmitter.emit();
    }

    askSpinner() {
        return this.displaySpinnerEmitter;
    }

    askSpinnerMessage() {
        return this.spinnerMessageEmitter;
    }
}
