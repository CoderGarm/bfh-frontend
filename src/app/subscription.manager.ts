import {Subscription} from "rxjs";
import {Component, OnDestroy} from "@angular/core";
import {AppInjector} from "./app.module";
import {TokenStorage} from "./services/authentication/token-storage.service";
import {Fleet} from "./services/swagger";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

@Component({
    template: ''
})
export class SubscriptionManager implements OnDestroy {

    subscriptions: Subscription[] = [];

    tokenStorage = AppInjector.get(TokenStorage);
    breakpointObserver = AppInjector.get(BreakpointObserver);

    readonly userId: number;
    readonly userName: string;
    readonly profilePic: string;

    isMobileBrowser: boolean = false;
    isHandheldDisplaySize: boolean = false;

    constructor() {
        this.userId = this.tokenStorage.getUserID();
        this.userName = this.tokenStorage.getLogin();
        this.profilePic = this.tokenStorage.getProfilePic();

        this.breakpointObserver.observe(Breakpoints.Handset).subscribe(result => this.isHandheldDisplaySize = result.matches);
    }


    isOwnFleet(fleet: Fleet) {
        return fleet.owner.idUser == this.userId;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
