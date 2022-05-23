import {AfterViewInit, Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {
    BattleReport,
    BattleReportApiService,
    CounterMissileHit,
    Fleet,
    FleetOrbit,
    LossRole,
    MissileMovement,
    MovementAction,
    PlanetApiService,
    ReleasedVolley,
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

    isExpanded: boolean = false;

    //** accordion paginator block **\\

    starSystem?: StarSystem;

    combatRounds: Int8Array = new Int8Array();
    movementsByRound: Map<number, MovementAction[]> = new Map<number, MovementAction[]>();
    missileMovementsByRound: Map<number, MissileMovement[]> = new Map<number, MissileMovement[]>();
    volleysByRound: Map<number, ReleasedVolley[]> = new Map<number, ReleasedVolley[]>();
    shipKillerHitsByRound: Map<number, ShipKillerHit[]> = new Map<number, ShipKillerHit[]>();
    counterMissileHitsByRound: Map<number, CounterMissileHit[]> = new Map<number, CounterMissileHit[]>();

    combatArenaData?: CombatArenaData;
    private activeRoundIndex: number = 0;
    activeRound?: number;

    @ViewChild(MatSlider)
    matSlider?: MatSlider;

    private setActiveRound() {
        if (this.activeRoundIndex < 0) {
            this.activeRoundIndex = 0;
        }
        this.activeRound = this.combatRounds[this.activeRoundIndex];
    }

    constructor(private tokenStorage: TokenStorage,
                private reportApi: BattleReportApiService,
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
            let sub = this.planetApi.getPlanetByCoordinates(system.idStarSystem, orbit)
                .subscribe(resp => {
                    if (!!resp) {
                        destination += resp.name;
                    } else {
                        destination += orbit!.xCoordinate.coordinate + ", " + orbit!.yCoordinate.coordinate;
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
        this.combatRunSubscription?.unsubscribe();
        this.currentlyOpenedItem = report;
        this.starSystem = report.orbit.system;
        this.currentlyOpenedItemIndex = this.battleReports.indexOf(report);

        this.clear();
        this.setCombatStatisticsDataSource(report);
        report.movementActions.forEach(ma => this.setMovementMapValue(ma));
        report.missileMovements.forEach(rv => this.setMissileMovementMapValue(rv));
        report.releasedVolleys.forEach(rv => this.setReleasedVolleyMapValue(rv));
        report.shipKillerHits.forEach(rv => this.setShipKillerHitsMapValue(rv));
        report.counterMissileHits.forEach(rv => this.setCounterMissileHitsMapValue(rv));
        this.mergeCombatRounds();
        this.combatArenaData = new CombatArenaData(this.combatRounds, this.movementsByRound, this.volleysByRound, this.missileMovementsByRound, this.shipKillerHitsByRound, this.counterMissileHitsByRound);
        this.activeRoundIndex = 0;
        this.setActiveRound();
    }

    /**
     * sets the {@link currentlyOpenedItem} for the closed item
     * @param report
     */
    setClosed(report: BattleReport) {
        if (this.currentlyOpenedItem === report) {
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

    checkDisplayOverlay(report: BattleReport, loss: LossRole) {
        const reportIsForSelectedLoss = !!this.lossReport && loss.warShipName === this.lossReport.lossRole.warShipName;
        const openedAccordionMatchesReport = this.currentlyOpenedItemIndex == this.battleReports.indexOf(report);
        return this.isExpanded && openedAccordionMatchesReport && reportIsForSelectedLoss;
    }

    private setCombatStatisticsDataSource(report: BattleReport) {
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

    setExpanded(mustExpand: boolean) {
        this.isExpanded = mustExpand;
    }

    private combatRunSubscription?: Subscription;

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
}

