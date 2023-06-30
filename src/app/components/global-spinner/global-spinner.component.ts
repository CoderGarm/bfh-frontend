import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {SpinnerService} from "../../services/spinner.service";
import {SubscriptionManager} from "../../subscription.manager";

@Component({
    selector: 'app-global-spinner',
    templateUrl: './global-spinner.component.html',
    styleUrls: ['./global-spinner.component.scss']
})
export class GlobalSpinnerComponent extends SubscriptionManager implements OnInit {

    inProgress: boolean = false;

    message?: string;

    constructor(private spinnerService: SpinnerService,
                public translate: TranslateService) {
        super();
        let sub = this.spinnerService.askSpinner().subscribe(event => this.inProgress = event);
        this.subscriptions.push(sub);

        sub = this.spinnerService.askSpinnerMessage().subscribe(message => this.message = message);
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
    }

    getMessage() {
        if (!this.message) {
            return '';
        }

        let translation = this.message;
        this.translate.get(this.message).subscribe((translated: string) => {
            translation = translated;
        });
        return translation;
    }
}
