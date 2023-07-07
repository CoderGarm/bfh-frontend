import {EventEmitter, Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

/**
 * Displays the spinner with or without a message.
 */
@Injectable()
export class SpinnerService {

    private displaySpinnerEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
    private spinnerMessageEmitter: EventEmitter<string> = new EventEmitter<string>();

    constructor(private translate: TranslateService) {
    }

    activateSpinner(spinnerMessage?: string) {
        this.displaySpinnerEmitter.emit(true);
        this.spinnerMessageEmitter.emit(this.getMessage(spinnerMessage));
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

    getMessage(message?: string) {
        if (!message) {
            return '';
        }

        let translation = message;
        this.translate.get(message).subscribe((translated: string) => {
            translation = translated;
        });
        return translation;
    }
}
