import {Component, OnInit} from '@angular/core';
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {SubscriptionManager} from "../../../SubscriptionManager";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends SubscriptionManager implements OnInit {

    static path: string = 'profile';

    role?: string;

    constructor(private tokenStorage: TokenStorage) {
        super();

    }

    ngOnInit(): void {
        this.role = this.tokenStorage.getRole();
    }
}
