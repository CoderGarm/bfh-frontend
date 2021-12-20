import {AfterViewInit, Component} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {BattleReport, FleetOrbit, PlanetApiService, ReportApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-battle-report',
    templateUrl: './battle-report.component.html',
    styleUrls: ['./battle-report.component.scss']
})
export class BattleReportComponent extends SubscriptionManager implements AfterViewInit {

    battleReports: BattleReport[] = [];

    constructor(private tokenStorage: TokenStorage,
                private reportApi: ReportApiService,
                private planetApi: PlanetApiService) {
        super();
    }

    ngAfterViewInit(): void {
        let userID = this.tokenStorage.getUserID();
        let sub = this.reportApi.getAllReportsWithUser(userID)
            .subscribe(resp => {
                this.battleReports = resp;
            });
        this.subscriptions.push(sub);
    }

    private m: Map<FleetOrbit, string> = new Map<FleetOrbit, string>();

    getOrbitRepresentation(fleetOrbit: FleetOrbit) {
        let destString = this.m.get(fleetOrbit);
        if (!!destString) {
            return destString;
        }
        let destination = "";

        let orbit = fleetOrbit.orbit;
        let system = fleetOrbit.system;

        if (!!orbit && !!system) {
            let sub = this.planetApi.getPlanetByCoordinates(system.idStarSystem, orbit)
                .subscribe(resp => {
                    if (!!resp) {
                        destination += resp.name;
                    } else {
                        destination += orbit!.xCoordinate + ", " + orbit!.yCoordinate;
                    }
                    destination += " in " + system!.name;
                    this.m.set(fleetOrbit, destination);
                    return destination;
                });
            this.subscriptions.push(sub);
        }
        return destination;
    }
}
