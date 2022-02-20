import {AfterViewInit, Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {BattleReport, Fleet, FleetOrbit, LossRole, PlanetApiService, ReleasedVolley, ReportApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {MatSort} from "@angular/material/sort";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
    selector: 'app-battle-report',
    templateUrl: './battle-report.component.html',
    styleUrls: ['./battle-report.component.scss']
})
export class BattleReportComponent extends SubscriptionManager implements AfterViewInit {

    displayedColumnsCombatStatistics: string[] = ['Fleet', 'Kills', 'Losses', 'Released missiles', 'Released beams'];

    dataSourceCombatStatistics = new MatTableDataSource<CombatStatistics>([]);

    /**
     * the displayed combat report
     */
    currentlyOpenedItem?: BattleReport;
    currentlyOpenedItemIndex?: number;

    /**
     * if present the overlay is displayed, otherwise not
     */
    lossReport?: CombatReport;

    battleReports: BattleReport[] = [];
    private orbitNames: Map<FleetOrbit, string> = new Map<FleetOrbit, string>();

    @ViewChildren(MatSort)
    sort = new QueryList<MatSort>();
    @ViewChildren(MatTable)
    tables = new QueryList<MatTable<CombatStatistics>>();

    //** accordion paginator block **\\
    @ViewChild(MatPaginator, {static: true})
    paginator?: MatPaginator;

    length: number = 0;
    pageIndex: number = 0;
    pageSize: number = 5;

    //** accordion paginator block **\\


    constructor(private tokenStorage: TokenStorage,
                private reportApi: ReportApiService,
                private planetApi: PlanetApiService) {
        super();
    }

    ngAfterViewInit(): void {
        this.fetchByPagination({pageIndex: 0, pageSize: 5});
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
    }

    getOrbitRepresentation(fleetOrbit: FleetOrbit) {
        let destString = this.orbitNames.get(fleetOrbit);
        let orbit = fleetOrbit.orbit;
        let system = fleetOrbit.system;
        let destination = "";
        if (!!destString) {
            return destString;
        } else {
            destination += orbit!.xCoordinate + ", " + orbit!.yCoordinate;
        }
        destination += " in " + system!.name;
        return destination;
    }

    fetchOrbitRepresentation(fleetOrbit: FleetOrbit) {
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
                    this.orbitNames.set(fleetOrbit, destination);
                });
            this.subscriptions.push(sub);
        }
    }

    /**
     * sets the {@link currentlyOpenedItem} for the opened item
     * @param report
     */
    setOpened(report: BattleReport) {
        this.currentlyOpenedItem = report;
        this.currentlyOpenedItemIndex = this.battleReports.indexOf(report);

        let userID = this.tokenStorage.getUserID();
        const dataByFleet: Map<number, CombatStatistics> = new Map<number, CombatStatistics>();
        report.participatingFleets.forEach(fleet =>
            dataByFleet.set(fleet.idFleet, new CombatStatistics(fleet, userID == fleet.owner.idUser))
        );
        report.shipKillerHits.forEach(hit => {
            hit.hitLogs.forEach(hitLog => {
                let actorReport = dataByFleet.get(hit.actor.idFleet);
                let lossRole = hit.lossesByHit[hitLog.combatRoundKey.id];
                if (!!lossRole) {
                    let lossRep = dataByFleet.get(lossRole.fleet.idFleet);
                    lossRep!.losses++;
                    actorReport!.kills++;
                }
            });
        });
        report.releasedVolleys.forEach(volley => {
            let combatReport = dataByFleet.get(volley.actor.idFleet);
            if (volley.weaponType === ReleasedVolley.WeaponTypeEnum.MISSILE) {
                combatReport!.releasedMissiles++;
            }
            if (volley.weaponType === ReleasedVolley.WeaponTypeEnum.BEAM) {
                combatReport!.releasedBeams++;
            }
        });
        this.dataSourceCombatStatistics.data = Array.from(dataByFleet.values());
        if (!!this.sort && this.currentlyOpenedItemIndex !== undefined && this.currentlyOpenedItemIndex !== null) {
            this.dataSourceCombatStatistics.sort = this.sort.toArray()[this.currentlyOpenedItemIndex];
        }
    }

    /**
     * sets the {@link currentlyOpenedItem} for the closed item
     * @param itemIndex
     */
    setClosed(itemIndex: BattleReport) {
        if (this.currentlyOpenedItem === itemIndex) {
            this.currentlyOpenedItem = undefined;
            this.currentlyOpenedItemIndex = undefined;
            this.dataSourceCombatStatistics.data = [];
        }
    }

    showOverlay(report: BattleReport, loss: LossRole) {
        this.lossReport = new CombatReport(report, loss);
    }

    /**
     * loads the
     */
    fetchByPagination(pageEvent: PageEvent | any) {
        let pageNumber = pageEvent.pageIndex;
        let pageSize = pageEvent.pageSize;
        let userID = this.tokenStorage.getUserID();
        let sub = this.reportApi.getReportsWithUserWithPaging(userID, pageNumber, pageSize)
            .subscribe(resp => {
                this.battleReports = resp;
                this.length = this.battleReports.length;
                this.battleReports.forEach(report => {
                    this.fetchOrbitRepresentation(report.orbit);
                });
            });
        this.subscriptions.push(sub);
    }
}

export class CombatReport {


    constructor(report: BattleReport, lossRole: LossRole) {
        this.lossRole = lossRole;

        const releasedVolleysByDamageDealerId: Map<string, ReleasedVolley> = new Map<string, ReleasedVolley>();
        report.releasedVolleys.map(volley => {
            releasedVolleysByDamageDealerId.set(volley.damageDealer, volley);
        })
        report.shipKillerHits.forEach(hit => {
            hit.hitLogs.forEach(hitLog => {
                if (hitLog.warShip.name === lossRole.warShipName) {
                    let releasedVolley = releasedVolleysByDamageDealerId.get(hit.damageDealer);
                    if (!releasedVolley) {
                        throw new Error("It seems that you was hit by a ghost missile. Please call the administrator.")
                    }
                    if (releasedVolley!.weaponType === ReleasedVolley.WeaponTypeEnum.BEAM) {
                        this.beamHits++;
                    }
                    if (releasedVolley!.weaponType === ReleasedVolley.WeaponTypeEnum.MISSILE) {
                        this.missileHits++;
                    }
                    if (!hitLog.alive) {
                        this.destroyedBy = releasedVolley.actor.name;
                    }
                    if (!hitLog.fightingCapable) {
                        this.finalHitBy = releasedVolley.actor.name;
                    }
                }
            });
        });
    }

    destroyedBy: string = "";
    finalHitBy: string = "";
    beamHits = 0;
    missileHits = 0;
    lossRole: LossRole;
}

class CombatStatistics {
    constructor(fleet: Fleet, isLoggedInUser: boolean) {
        this.isLoggedInUser = isLoggedInUser;
        this.fleetName = fleet.name;
    }

    isLoggedInUser: boolean;
    fleetName: string;
    losses: number = 0;
    kills: number = 0;
    releasedMissiles: number = 0;
    releasedBeams: number = 0;
}
