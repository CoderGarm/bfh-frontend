import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {Alliance, AllianceApiService, JWT} from "../../../../../services/swagger";
import {AllianceHelper} from "../../../alliance.helper";
import GameUserRolesEnum = JWT.GameUserRolesEnum;

@Component({
    selector: 'app-alliance-list',
    templateUrl: './alliance-list.component.html',
    styleUrls: ['./alliance-list.component.scss']
})
export class AllianceListComponent extends SubscriptionManager implements OnInit {

    idAlliance?: number;
    isAdmin: boolean = false;
    alliances: Alliance[] = [];
    applicationOpenAt: Alliance[] = [];

    constructor(private allianceApi: AllianceApiService) {
        super();
    }

    ngOnInit(): void {
        this.reload();
    }

    private reload() {
        let sub = this.allianceApi.getAlliances().subscribe(resp => this.alliances = resp);
        this.subscriptions.push(sub);
        sub = this.allianceApi.getOpenApplications().subscribe(resp => this.applicationOpenAt = resp);
        this.subscriptions.push(sub);
        this.idAlliance = this.tokenStorage.getAllianceID();
        this.isAdmin = AllianceHelper.isAllianceAdmin(this.tokenStorage.getGameRoles());
    }

    isApplicantAt(alliance?: Alliance): boolean {
        if (!alliance) {
            return this.applicationOpenAt.length > 0;
        }
        return this.applicationOpenAt.filter(a => a.idAlliance === alliance.idAlliance).length > 0;
    }

    apply(alliance: Alliance) {
        this.allianceApi.applyForMembership(alliance.idAlliance).subscribe(resp => {
            if (resp) {
                this.reload();
            }
        });
    }

    revoke(alliance: Alliance) {
        this.allianceApi.withdrawApplication(alliance.idAlliance).subscribe(resp => {
            if (resp) {
                this.reload();
            }
        });
    }

    leave() {
        this.allianceApi.leaveAlliance().subscribe(resp => {
            if (resp) {
                this.tokenStorage.setAllianceID(undefined);
                const gameRoles: GameUserRolesEnum[] = [];
                this.tokenStorage.getGameRoles().forEach(r => {
                    if (r != GameUserRolesEnum.ALLIANCE_ADMIN) {
                        gameRoles.push(r);
                    }
                })
                this.tokenStorage.setGameRoles(gameRoles);
                this.reload();
            }
        });
    }
}
