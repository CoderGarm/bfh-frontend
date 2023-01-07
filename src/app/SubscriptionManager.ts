import {Subscription} from "rxjs";
import {Component} from "@angular/core";
import {AppInjector} from "./app.module";
import {TokenStorage} from "./services/authentication/token-storage.service";
import {Fleet} from "./services/swagger";

@Component({
    template: ''
})
export class SubscriptionManager {

    subscriptions: Subscription[] = [];

    tokenStorage = AppInjector.get(TokenStorage);

    readonly userId: number;

    constructor() {
        this.userId = this.tokenStorage.getUserID();
    }


    isOwnFleet(fleet: Fleet) {
        return fleet.owner.idUser == this.userId;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
