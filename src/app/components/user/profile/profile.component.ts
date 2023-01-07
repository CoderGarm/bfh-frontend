import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../SubscriptionManager";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends SubscriptionManager implements OnInit {

    static path: string = 'profile';

    role?: string;

    constructor() {
        super();

    }

    ngOnInit(): void {
        this.role = this.tokenStorage.getRole();
    }
}
