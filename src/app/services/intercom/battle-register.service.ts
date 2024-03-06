import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {SubscriptionManager} from "../../subscription.manager";
import {DialogConfigHelper} from "../helper/dialog-config.helper";
import {BattleReport, BattleReportApiService, BattleReportStatistics, FleetOrbit, PlanetApiService, StarSystem} from "../swagger";
import {Subscription} from "rxjs";
import {SnackbarNotificationService} from "../snackbar-notification.service";
import {BattleRegisterComponent} from "../../modules/journal/components/payload/battle-register/battle-register.component";
import {MatTableDataSource} from "@angular/material/table";
import {CombatStatistics} from "../../modules/journal/combat-statistics";
import {CombatReport} from "../../modules/journal/combat-report";
import {CombatArenaData} from "../../modules/journal/combat-arena-data";
import {DoNotScrollService} from "./do-not-scroll.service";
import {SpinnerService} from "../spinner.service";

@Injectable()
export class BattleRegisterService extends SubscriptionManager {

    displayedColumnsCombatStatistics: string[] = ['Fleet', 'Kills', 'Losses', 'Released missiles', 'Released beams'];

    dataSourceCombatStatistics = new MatTableDataSource<CombatStatistics>([]);

    currentlyOpenedItem?: BattleReport;
    currentlyOpenedItemIndex?: number;
    lossReport?: CombatReport;
    battleReports: BattleReportStatistics[] = [];

    starSystem?: StarSystem;
    combatArenaData?: CombatArenaData;
    activeRound?: number;
    battleReportsById: Map<number, BattleReport> = new Map<number, BattleReport>();
    orbitNames: Map<string, string> = new Map<string, string>();
    activeRoundIndex: number = 0;
    combatRunSubscription?: Subscription;

    constructor(private dialog: MatDialog,
                public notif: SnackbarNotificationService,
                public reportService: BattleReportApiService,
                public planetService: PlanetApiService,
                public noScrollService: DoNotScrollService,
                public spinnerService: SpinnerService,) {
        super();
    }

    openRegister() {

        const dialogConfig = DialogConfigHelper.createBattleRegisterDialog();
        (<string[]>dialogConfig.panelClass).push('battle-register-dialog')
        const dialogRef = this.dialog.open(BattleRegisterComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result: any) => {
            console.log("batle register closed")
        });
    }

    fetchData() {
        this.spinnerService.activateSpinner('Loading battles...');
        this.fetchBattleReportStatistics();
        this.dataSourceCombatStatistics.sortingDataAccessor = (item, property) => {
            switch (property) {
                case this.displayedColumnsCombatStatistics[0]:
                    return item.fleetName;
                case this.displayedColumnsCombatStatistics[1]:
                    return item.kills;
                case this.displayedColumnsCombatStatistics[2]:
                    return item.losses;
                case this.displayedColumnsCombatStatistics[3]:
                    return item.releasedMissiles;
                case this.displayedColumnsCombatStatistics[4]:
                    return item.releasedBeams;
                default:
                    return '';
            }
        }
        this.openRegister();
    }

    setActiveRound() {
        if (this.activeRoundIndex < 0) {
            this.activeRoundIndex = 0;
        }
        this.activeRound = this.combatArenaData?.combatRounds[this.activeRoundIndex];
    }

    getFleetOrbitKey(fleetOrbit: FleetOrbit): string {
        let orbit = fleetOrbit.orbit;
        let system = fleetOrbit.system;
        let s = undefined;
        if (!!orbit) {
            let x = orbit.xCoordinate;
            let y = orbit.yCoordinate;
            s = x.coordinate + "." + x.distanceMetric + "-" + y.coordinate + "." + y.distanceMetric;
        }
        if (system) {
            if (!!s) {
                s += system.idStarSystem + "";
            } else {
                s = system.idStarSystem + "";
            }
        }
        // one of both is set
        return s!;
    }

    fetchBattleReportStatistics() {
        let sub = this.reportService.getReportsForUser()
            .subscribe(resp => {
                this.battleReports = resp;
                this.battleReports.forEach(report => {
                    this.fetchOrbitRepresentation(report.orbit);
                });
                this.spinnerService.deactivateSpinner();
            });
        this.subscriptions.push(sub);
    }

    fetchOrbitRepresentation(fleetOrbit: FleetOrbit) {
        let destination = "";
        let orbit = fleetOrbit.orbit;
        let system = fleetOrbit.system;

        if (!!orbit && !!system) {
            let name = this.orbitNames.get(this.getFleetOrbitKey(fleetOrbit));
            if (!!name) {
                return;
            }
            let sub = this.planetService.getPlanetByCoordinates(orbit, system.idStarSystem)
                .subscribe(resp => {
                    if (!!resp) {
                        destination += resp.name;
                    } else {
                        destination += orbit!.xCoordinate.coordinate + ", " + orbit!.yCoordinate.coordinate;
                    }
                    destination += " in " + system!.name;
                    this.orbitNames.set(this.getFleetOrbitKey(fleetOrbit), destination);
                });
            this.subscriptions.push(sub);
        }
    }

    getOrbitRepresentation(fleetOrbit: FleetOrbit) {
        let destString = this.orbitNames.get(this.getFleetOrbitKey(fleetOrbit));
        let orbit = fleetOrbit.orbit;
        let system = fleetOrbit.system;
        let destination = "";
        if (!!destString) {
            return destString;
        } else {
            destination += orbit!.xCoordinate.coordinate + ", " + orbit!.yCoordinate.coordinate;
        }
        destination += " in " + system!.name;
        return destination;
    }
}
