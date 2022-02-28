import {Subscription} from "rxjs";
import {Component} from "@angular/core";

@Component({
    template: ''
})
export class SubscriptionManager {

    subscriptions: Subscription[] = [];

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
