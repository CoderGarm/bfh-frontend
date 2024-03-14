import {EventEmitter, Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {NgxSpinnerService} from "ngx-spinner";
import {SubscriptionManager} from "../subscription.manager";


export interface SpinnerMessage {
    showSpinner: boolean,
    message?: string
}

/**
 * Displays the spinner with or without a message.
 */
@Injectable()
export class SpinnerService extends SubscriptionManager {

    private displaySpinnerEmitter: EventEmitter<SpinnerMessage> = new EventEmitter<SpinnerMessage>();

    imageLink: string = '';

    private static readonly IMG_START_NO: number = 1;
    private static readonly IMG_NO: number = 21;

    isAdvisorySpinnerActive: boolean = false;

    constructor(private translate: TranslateService,
                private spinner: NgxSpinnerService) {
        super();

        this.imageLink = this.getImageURL();
        let sub = this.spinner.getSpinner('advisory-spinner').subscribe(sp => this.isAdvisorySpinnerActive = sp.show);
        this.subscriptions.push(sub);
    }

    randomIntFromInterval(min: number, max: number) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    private getImageURL() {
        const number = this.randomIntFromInterval(SpinnerService.IMG_START_NO, SpinnerService.IMG_NO);
        const isPng: boolean = number >= 22 && number <= 25;
        const ending: string = isPng ? '.png' : '.jpeg';
        return 'assets/images/entry/' + number + ending;
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
