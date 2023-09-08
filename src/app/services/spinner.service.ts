import {EventEmitter, Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {NgxSpinnerService} from "ngx-spinner";


export interface SpinnerMessage {
    showSpinner: boolean,
    message?: string
}

/**
 * Displays the spinner with or without a message.
 */
@Injectable()
export class SpinnerService {

    private displaySpinnerEmitter: EventEmitter<SpinnerMessage> = new EventEmitter<SpinnerMessage>();

    constructor(private translate: TranslateService,
                private spinner: NgxSpinnerService) {
    }

    activateSpinner(spinnerMessage?: string) {
        const message = this.getMessage(spinnerMessage);
        this.displaySpinnerEmitter.emit({
            showSpinner: true,
            message: message
        });
    }

    deactivateSpinner() {
        this.displaySpinnerEmitter.emit({
            showSpinner: false
        });
    }

    askSpinner() {
        return this.displaySpinnerEmitter;
    }


    getMessage(message?: string) {
        if (!message) {
            return '';
        }

        let translation = message;
        this.translate.get(message).subscribe((translated: string) => {
            if (!!translated) {
                translation = translated;
            }
        });
        return translation;
    }

    show(spinnerName: string) {
        this.spinner.show(spinnerName);
    }

    hide(spinnerName: string) {
        this.spinner.hide(spinnerName);
    }
}
