import {Subscription} from "rxjs";
import {Component, OnDestroy} from "@angular/core";
import {AppInjector} from "./app.module";
import {TokenStorage} from "./services/authentication/token-storage.service";
import {Fleet} from "./services/swagger";

@Component({
    template: ''
})
export class SubscriptionManager implements OnDestroy {

    subscriptions: Subscription[] = [];

    tokenStorage = AppInjector.get(TokenStorage);

    readonly userId: number;
    readonly userName: string;

    constructor() {
        this.userId = this.tokenStorage.getUserID();
        this.userName = this.tokenStorage.getLogin();
    }


    isOwnFleet(fleet: Fleet) {
        return fleet.owner.idUser == this.userId;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
