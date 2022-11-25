import {Component, OnInit} from '@angular/core';
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {TypeService} from "../../../services/type.service";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {BackgroundService} from "../../../services/background.service";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends SubscriptionManager implements OnInit {

    static path: string = 'profile';

    role?: string;

    constructor(private tokenStorage: TokenStorage,
                private typeService: TypeService,
                private backgroundService: BackgroundService) {
        super();

    }

    ngOnInit(): void {
        this.role = this.tokenStorage.getRole();
    }
}
