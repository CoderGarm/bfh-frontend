import {AfterViewInit, Component} from '@angular/core';
import {Alliance, AllianceApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {AllianceHelper} from "../../../alliance.helper";
import {AllianceCommunicationService} from "../../../alliance-communication.service";

@Component({
    selector: 'app-alliance-tab-view',
    templateUrl: './alliance-tab-view.component.html',
    styleUrls: ['./alliance-tab-view.component.scss']
})
export class AllianceTabViewComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'alliance';

    alliance?: Alliance;
    isAdmin: boolean = false;
    allianceID?: number;
    applicationOpenAt: Alliance[] = [];

    constructor(private allianceApi: AllianceApiService,
                private allyNotificationService: AllianceCommunicationService) {
        super();

        let sub = this.allyNotificationService.askCreation().subscribe(() => this.fetchBaseData());
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
        this.fetchBaseData();
    }

    private fetchBaseData() {
        let sub = this.allianceApi.getAllianceForUser().subscribe(resp => this.alliance = resp);
        this.subscriptions.push(sub);

        this.allianceID = this.tokenStorage.getAllianceID();
        this.isAdmin = AllianceHelper.isAllianceAdmin(this.tokenStorage.getGameRoles());

        sub = this.allianceApi.getOpenApplications().subscribe(resp => this.applicationOpenAt = resp);
        this.subscriptions.push(sub);
    }

    isApplicantAt(alliance?: Alliance): boolean {
        if (!alliance) {
            return this.applicationOpenAt.length > 0;
        }
        return this.applicationOpenAt.filter(a => a.idAlliance === alliance.idAlliance).length > 0;
    }
}
