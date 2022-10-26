import {AfterViewInit, Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {
    BattleReport,
    BattleReportApiService,
    BattleReportStatistics,
    CombatRound,
    CounterMissileHit,
    Fleet,
    FleetOrbit,
    HitLog,
    LossRole,
    MissileMovement,
    MovementAction,
    PlanetApiService,
    ReleasedVolley,
    ShipClass,
    ShipKillerHit,
    StarSystem
} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {MatSort} from "@angular/material/sort";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {CombatReport} from "../../../combat-report";
import {CombatStatistics} from "../../../combat.statistics";
import {CombatArenaData} from "../combat-arena/combat-arena.component";
import {MatSlider, MatSliderChange} from "@angular/material/slider";
import {Subscription, timer} from "rxjs";
import {SpinnerService} from "../../../../../services/spinner.service";

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

    //** accordion paginator block **\\

    starSystem?: StarSystem;

    combatRounds: Int8Array = new Int8Array();
    movementsByRound: Map<number, MovementAction[]> = new Map<number, MovementAction[]>();
    missileMovementsByRound: Map<number, MissileMovement[]> = new Map<number, MissileMovement[]>();
    volleysByRound: Map<number, ReleasedVolley[]> = new Map<number, ReleasedVolley[]>();
    shipKillerHitsByRound: Map<number, ShipKillerHit[]> = new Map<number, ShipKillerHit[]>();
    counterMissileHitsByRound: Map<number, CounterMissileHit[]> = new Map<number, CounterMissileHit[]>();
    hitLogsByRound: Map<number, HitLog[]> = new Map<number, HitLog[]>();
    shipClasses: Map<number, ShipClass> = new Map<number, ShipClass>();

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
        this.activeRound = this.combatRounds[this.activeRoundIndex];
    }

    constructor(private tokenStorage: TokenStorage,
                private reportApi: BattleReportApiService,
                private planetApi: PlanetApiService,
                private spinnerService: SpinnerService) {
        super();
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

    /**
     * sets the {@link currentlyOpenedItem} for the opened item
     * @param reportStat
     */
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
        this.currentlyOpenedItem.movementActions.forEach(ma => this.setMovementMapValue(ma));
        this.currentlyOpenedItem.missileMovements.forEach(rv => this.setMissileMovementMapValue(rv));
        this.currentlyOpenedItem.releasedVolleys.forEach(rv => this.setReleasedVolleyMapValue(rv));
        this.currentlyOpenedItem.shipKillerHits.forEach(rv => this.setShipKillerHitsMapValue(rv));
        this.currentlyOpenedItem.counterMissileHits.forEach(rv => this.setCounterMissileHitsMapValue(rv));
        this.currentlyOpenedItem.participatingFleets.forEach(fleet => this.setShipClasses(fleet));
        this.mergeCombatRounds();
        this.combatArenaData = new CombatArenaData(this.combatRounds,
            this.movementsByRound,
            this.volleysByRound,
            this.missileMovementsByRound,
            this.shipKillerHitsByRound,
            this.counterMissileHitsByRound,
            this.hitLogsByRound,
            Array.from(this.shipClasses.values()));
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
            this.combatRounds = new Int8Array();
            this.clear();
            this.combatArenaData = undefined;
        }
    }

    private clear() {
        this.combatRounds = new Int8Array();
        this.movementsByRound = new Map<number, MovementAction[]>();
        this.missileMovementsByRound = new Map<number, MissileMovement[]>();
        this.volleysByRound = new Map<number, ReleasedVolley[]>();
        this.shipKillerHitsByRound = new Map<number, ShipKillerHit[]>();
        this.counterMissileHitsByRound = new Map<number, CounterMissileHit[]>();
        this.hitLogsByRound = new Map<number, HitLog[]>();
        this.shipClasses = new Map<number, ShipClass>();
    }

    private setCounterMissileHitsMapValue(volley: CounterMissileHit) {
        const combatRound = volley.combatRoundKey.combatRound;
        let valueMap = this.counterMissileHitsByRound.get(combatRound.no);
        if (!valueMap) {
            valueMap = [];
            this.counterMissileHitsByRound.set(combatRound.no, valueMap);
        }
        valueMap.push(volley);
    }

    private setShipKillerHitsMapValue(volley: ShipKillerHit) {
        const combatRound = volley.combatRoundKey.combatRound;
        let valueMap = this.shipKillerHitsByRound.get(combatRound.no);
        if (!valueMap) {
            valueMap = [];
            this.shipKillerHitsByRound.set(combatRound.no, valueMap);
        }
        valueMap.push(volley);
        this.setHitLogMapValue(combatRound, volley.hitLogs);
    }

    private setHitLogMapValue(combatRound: CombatRound, volley: HitLog[]) {

        let valueMap = this.hitLogsByRound.get(combatRound.no);
        if (!valueMap) {
            valueMap = [];
            this.hitLogsByRound.set(combatRound.no, valueMap);
        }
        volley.forEach(hitLog => valueMap!.push(hitLog));
    }

    private setMissileMovementMapValue(volley: MissileMovement) {
        const combatRound = volley.combatRoundKey.combatRound;
        let valueMap = this.missileMovementsByRound.get(combatRound.no);
        if (!valueMap) {
            valueMap = [];
            this.missileMovementsByRound.set(combatRound.no, valueMap);
        }
        valueMap.push(volley);
    }

    private setReleasedVolleyMapValue(volley: ReleasedVolley) {
        const combatRound = volley.combatRoundKey.combatRound;
        let valueMap = this.volleysByRound.get(combatRound.no);
        if (!valueMap) {
            valueMap = [];
            this.volleysByRound.set(combatRound.no, valueMap);
        }
        valueMap.push(volley);
    }

    private setMovementMapValue(movementAction: MovementAction) {
        const combatRound = movementAction.combatRoundKey.combatRound;
        let valueMap = this.movementsByRound.get(combatRound.no);
        if (!valueMap) {
            valueMap = [];
            this.movementsByRound.set(combatRound.no, valueMap);
        }
        valueMap.push(movementAction);
    }

    private mergeCombatRounds() {
        const combatRounds: Set<number> = new Set<number>();
        Array.from(this.movementsByRound.keys()).forEach(cr => combatRounds.add(cr));
        Array.from(this.volleysByRound.keys()).forEach(cr => combatRounds.add(cr));
        let sorted = Array.from(combatRounds).sort((a, b) => a - b);
        this.combatRounds = new Int8Array(sorted);
    }

    showOverlay(report: BattleReportStatistics, loss: LossRole) {
        if (!!this.currentlyOpenedItem && this.currentlyOpenedItem.battleReportStatistics.idBattleReport == report.idBattleReport) {
            this.lossReport = new CombatReport(this.currentlyOpenedItem, loss);
        }
    }

    /**
     * loads the
     */
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
                    let lossRep = dataByFleet.get(lossRole.fleet.idFleet);
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
        this.pause();
        if (this.activeRoundIndex == this.combatRounds.length - 1) {
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
        this.pause();
        if (this.activeRoundIndex == this.combatRounds.length - 1) {
            return;
        }
        this.activeRoundIndex = this.combatRounds.length - 1;
        this.setActiveRound();
    }

    next() {
        this.pause();
        this.innerNext(true);
    }

    private innerNext(fastRewind: boolean) {
        let i: number = this.activeRoundIndex;
        if (++i >= this.combatRounds.length) {
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
        if (this.combatRounds.length != 0) {
            return this.combatRounds[this.combatRounds.length - 1];
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

    slideSlides($event: MatSliderChange) {
        this.slide($event.value);
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

    private setShipClasses(fleet: Fleet) {
        fleet.ships.forEach(warShip => {
            let idShipClass = warShip.shipClass.idShipClass;
            this.shipClasses.set(idShipClass!, warShip.shipClass);
        });
    }
}

