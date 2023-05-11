import {AfterViewInit, Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {
    BattleReport,
    BattleReportApiService,
    BattleReportStatistics,
    Fleet,
    FleetOrbit,
    LossRole,
    PlanetApiService,
    ReleasedVolley,
    StarSystem
} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {MatSort} from "@angular/material/sort";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {CombatReport} from "../../../combat-report";
import {CombatStatistics} from "../../../combat-statistics";
import {Subscription, timer} from "rxjs";
import {SpinnerService} from "../../../../../services/spinner.service";
import {CombatArenaData} from "../../../combat-arena-data";
import {MatSlider} from "@angular/material/slider";
import {DoNotScrollService} from "../../../../../services/intercom/do-not-scroll.service";

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

    battleReports: BattleReportStatistics[] = [];
    private battleReportsById: Map<number, BattleReport> = new Map<number, BattleReport>();
    private orbitNames: Map<string, string> = new Map<string, string>();

    @ViewChildren(MatSort)
    sort = new QueryList<MatSort>();
    @ViewChildren(MatTable)
    tables = new QueryList<MatTable<CombatStatistics>>();

    @ViewChild(MatPaginator, {static: true})
    paginator?: MatPaginator;
    battleReportAmount: number = 0;
    pageIndex: number = 0;
    pageSize: number = 5;

    isExpanded: boolean = false;

    starSystem?: StarSystem;

    combatArenaData?: CombatArenaData;
    private activeRoundIndex: number = 0;
    activeRound?: number;

    @ViewChild(MatSlider)
    matSlider?: MatSlider;

    private combatRunSubscription?: Subscription;

    private setActiveRound() {
        if (this.activeRoundIndex < 0) {
            this.activeRoundIndex = 0;
        }
        this.activeRound = this.combatArenaData?.combatRounds[this.activeRoundIndex];
    }

    constructor(private reportApi: BattleReportApiService,
                private planetApi: PlanetApiService,
                private noScrollService: DoNotScrollService,
                private spinnerService: SpinnerService) {
        super();

        this.noScrollService.setNoScroll();
    }

    ngOnDestroy() {
        this.noScrollService.clearScrolling();
        super.ngOnDestroy();
    }

    ngAfterViewInit(): void {
        let sub = this.reportApi.getReportsAmountWithUser().subscribe(resp => this.battleReportAmount = resp);
        this.subscriptions.push(sub);
        this.fetchByPagination({pageIndex: 0, pageSize: this.pageSize});
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

    fetchOrbitRepresentation(fleetOrbit: FleetOrbit) {
        let destination = "";
        let orbit = fleetOrbit.orbit;
        let system = fleetOrbit.system;

        if (!!orbit && !!system) {
            let name = this.orbitNames.get(this.getFleetOrbitKey(fleetOrbit));
            if (!!name) {
                return;
            }
            let sub = this.planetApi.getPlanetByCoordinates(orbit, system.idStarSystem)
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

    private getFleetOrbitKey(fleetOrbit: FleetOrbit): string {
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

    setOpened(reportStat: BattleReportStatistics) {
        this.combatRunSubscription?.unsubscribe();
        this.clear();

        let battleReport = this.battleReportsById.get(reportStat.idBattleReport);
        if (!!battleReport) {
            this.setActiveReport(battleReport);
        } else {
            this.spinnerService.activateSpinner("Battle is loading...")
            let sub = this.reportApi.getReportsById(reportStat.idBattleReport).subscribe(resp => {
                this.setActiveReport(resp);
                this.spinnerService.deactivateSpinner();
            });
            this.subscriptions.push(sub);
        }
        this.starSystem = reportStat.orbit.system;
        this.currentlyOpenedItemIndex = this.battleReports.indexOf(reportStat);
    }

    private setActiveReport(report: BattleReport) {
        this.currentlyOpenedItem = report;
        this.setCombatStatisticsDataSource();
        this.combatArenaData = new CombatArenaData(report);
        this.activeRoundIndex = 0;
        this.setActiveRound();
        this.battleReportsById.set(report.battleReportStatistics.idBattleReport, report);
    }

    /**
     * sets the {@link currentlyOpenedItem} for the closed item
     * @param report
     */
    setClosed(report: BattleReportStatistics) {
        if (!!this.currentlyOpenedItem && this.currentlyOpenedItem.battleReportStatistics.idBattleReport === report.idBattleReport) {
            this.currentlyOpenedItem = undefined;
            this.currentlyOpenedItemIndex = undefined;
            this.dataSourceCombatStatistics.data = [];
            this.starSystem = undefined;
            this.clear();
        }
    }

    private clear() {
        this.combatArenaData = undefined;
    }

    showOverlay(report: BattleReportStatistics, loss: LossRole) {
        if (!!this.currentlyOpenedItem && this.currentlyOpenedItem.battleReportStatistics.idBattleReport == report.idBattleReport) {
            this.lossReport = new CombatReport(this.currentlyOpenedItem, loss);
        }
    }

    fetchByPagination(pageEvent: PageEvent | any) {
        let pageNumber = pageEvent.pageIndex;
        let pageSize = pageEvent.pageSize;
        let sub = this.reportApi.getReportsWithUserWithPaging(pageNumber, pageSize)
            .subscribe(resp => {
                this.battleReports = resp;
                this.battleReports.forEach(report => {
                    this.fetchOrbitRepresentation(report.orbit);
                });
            });
        this.subscriptions.push(sub);
    }

    checkDisplayOverlay(report: BattleReportStatistics, loss: LossRole) {
        const reportIsForSelectedLoss = !!this.lossReport && loss.warShipName === this.lossReport.lossRole.warShipName;
        const openedAccordionMatchesReport = this.currentlyOpenedItemIndex == this.battleReports.indexOf(report);
        return this.isExpanded && openedAccordionMatchesReport && reportIsForSelectedLoss;
    }

    private setCombatStatisticsDataSource() {
        const report = this.currentlyOpenedItem!;
        let userID = this.tokenStorage.getUserID();
        const dataByFleet: Map<number, CombatStatistics> = new Map<number, CombatStatistics>();
        report.participatingFleets.forEach(fleet =>
            dataByFleet.set(fleet.idFleet, new CombatStatistics(fleet, userID == fleet.owner.idUser))
        );
        report.shipKillerHits.forEach(hit => {
            hit.hitLogs.forEach(hitLog => {
                let actorReport = dataByFleet.get(hit.actor.id);
                let lossRole = hit.lossesByHit[hitLog.combatRoundKey.id];
                if (!!lossRole) {
                    let lossRep = dataByFleet.get(lossRole.fleet.id);
                    lossRep!.losses++;
                    actorReport!.kills++;
                }
            });
        });
        report.releasedVolleys.forEach(volley => {
            let combatReport = dataByFleet.get(volley.actor.id);
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

    setExpanded(mustExpand: boolean) {
        this.isExpanded = mustExpand;
    }

    play() {
        if (!this.combatArenaData) {
            return;
        }
        this.pause();
        if (this.activeRoundIndex == this.combatArenaData.combatRounds.length - 1) {
            this.fastRewind();
        }
        let numberObservable = timer(0, 100);
        this.combatRunSubscription = numberObservable.subscribe(() => this.innerNext(false));
        this.subscriptions.push(this.combatRunSubscription);
    }

    stop() {
        this.pause();
        this.fastRewind();
    }

    pause() {
        if (!!this.combatRunSubscription) {
            this.combatRunSubscription.unsubscribe();
            this.combatRunSubscription = undefined;
        }
    }

    fastRewind() {
        this.pause();
        if (this.activeRoundIndex == 0) {
            return;
        }
        this.activeRoundIndex = 0;
        this.setActiveRound();
    }

    fastForward() {
        if (!this.combatArenaData) {
            return;
        }
        this.pause();
        if (this.activeRoundIndex == this.combatArenaData.combatRounds.length - 1) {
            return;
        }
        this.activeRoundIndex = this.combatArenaData.combatRounds.length - 1;
        this.setActiveRound();
    }

    next() {
        this.pause();
        this.innerNext(true);
    }

    private innerNext(fastRewind: boolean) {
        if (!this.combatArenaData) {
            return;
        }
        let i: number = this.activeRoundIndex;
        if (++i >= this.combatArenaData.combatRounds.length) {
            if (fastRewind) {
                this.fastRewind();
            }
            return;
        }
        this.activeRoundIndex++;
        this.setActiveRound();
    }

    previous() {
        this.pause();
        let i: number = this.activeRoundIndex;
        if (--i < 0) {
            this.fastForward();
            return;
        }
        this.activeRoundIndex--;
        this.setActiveRound();
    }

    getLastRound() {
        if (!!this.combatArenaData && this.combatArenaData.combatRounds.length != 0) {
            return this.combatArenaData.combatRounds[this.combatArenaData.combatRounds.length - 1];
        }
        return 0;
    }

    formatLabel(value: number) {
        return "# " + value;
    }

    slide(val: number | null) {
        this.activeRoundIndex = !!val ? val : 0;
        this.setActiveRound();
    }

    getLosses(reportStat: BattleReportStatistics): LossRole[] {
        if (!!this.currentlyOpenedItem && this.currentlyOpenedItem.battleReportStatistics.idBattleReport == reportStat.idBattleReport) {
            return this.currentlyOpenedItem.lossRole;
        }
        return [];
    }

    getFleets(reportStat: BattleReportStatistics): Fleet[] {
        if (!!this.currentlyOpenedItem && this.currentlyOpenedItem.battleReportStatistics.idBattleReport == reportStat.idBattleReport) {
            return this.currentlyOpenedItem.participatingFleets;
        }
        return [];
    }

}

