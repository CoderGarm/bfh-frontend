import {Component, OnInit} from '@angular/core';
import {Alliance, AllianceApiService, JWT} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import GameUserRolesEnum = JWT.GameUserRolesEnum;

@Component({
    selector: 'app-alliance-tab-view',
    templateUrl: './alliance-tab-view.component.html',
    styleUrls: ['./alliance-tab-view.component.scss']
})
export class AllianceTabViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'alliance';

    alliance?: Alliance;
    isAdmin: boolean = false;

    constructor(private allianceApi: AllianceApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.allianceApi.getAllianceForUser().subscribe(resp => this.alliance = resp);
        this.subscriptions.push(sub);

        let gameRoles = this.tokenStorage.getGameRoles();
        const index: number = gameRoles.indexOf(GameUserRolesEnum.ALLIANCE_ADMIN);
        if (index != -1) {
            this.isAdmin = true;
        }
    }

}
