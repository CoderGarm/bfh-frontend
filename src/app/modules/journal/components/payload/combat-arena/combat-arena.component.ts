import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {
    AbstractId,
    BattleReport,
    CounterMissileHit,
    Fleet,
    FleetMarker,
    HitLog,
    MissileMovement,
    MovementAction,
    Planet,
    ReleasedVolley,
    ShipClass,
    ShipKillerHit,
    StarSystem
} from "../../../../../services/swagger";
import {BattleViewHelper} from "../../../battle-view-helper";

@Component({
    selector: 'app-combat-arena',
    templateUrl: './combat-arena.component.html',
    styleUrls: ['./combat-arena.component.scss']
})
export class CombatArenaComponent extends BattleViewHelper implements AfterViewInit, OnChanges {

    @Input()
    starSystem?: StarSystem;
    private starSystemSelectionInputDefinition: string = "starSystemSelection";

    @Input()
    battleReport?: BattleReport;
    private battleReportInputDefinition: string = "battleReport";

    planets: Planet[] = [];

    red: Fleet[] = [];
    green: Fleet[] = [];

    @Input()
    combatArenaData?: CombatArenaData;
    private combatArenaDataInputDefinition: string = "combatArenaData";

    /**
     * The active round will be defined at least - if this is changed, every needed information is present.
     */
    @Input()
    activeRound?: number;
    private activeRoundInputDefinition: string = "activeRound";

    hoveredWarship?: AbstractId;
    clickedFleet?: FleetMarker;

    constructor(tokenStorage: TokenStorage) {
        super(tokenStorage)
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes[this.starSystemSelectionInputDefinition]) {
            this.createStarMap();
        }
        if (changes[this.battleReportInputDefinition]) {
            this.setUpCombat();
            this.setBattleReport(this.battleReport);
        }
        if (changes[this.activeRoundInputDefinition]) {
            if (!!this.starSystem) {
                this.createCanvas("combat-arena", '#arena')
                this.setActiveRound(this.activeRound, this.starSystem, this.canvas!, this.clickForFleet, this.mouseoverForWarship);
                let orbit = this.battleReport!.battleReportStatistics.orbit;
                this.setViewBoxByFleetOrbit(orbit);
            }
        }
        if (changes[this.combatArenaDataInputDefinition]) {
            if (!this.combatArenaData && !this.starSystem) {
                this.clearCanvas();
            }
        }
    }

    private clickForFleet = (event: PointerEvent) => {
        let fleetMarker = this.getFleetByEvent(event);
        if (!fleetMarker) {
            let text = this.getTextByEvent(event);
            if (!!text) {
                fleetMarker = this.getFleetByText(text);
            }
        }
        this.clickedFleet = fleetMarker;
    }

    private mouseoverForWarship = (event: PointerEvent) => {
        this.hoveredWarship = this.getWarshipByEvent(event);
    }

    /**
     * main method of this fuckin' shit - creates everything by the current data
     * @private
     */
    private createStarMap() {
        if (!!this.starSystem) {
            if (!this.canvas) {
                //this.createCanvas()
                this.createCanvas("combat-arena", '#arena')
            } else {
                this.clearCanvas();
            }
            this.setOrbits(this.canvas!, this.starSystem);
        } else {
            this.clearCanvas();
        }
    }

    /**
     * sets up the combat
     */
    private setUpCombat() {
        const green: Fleet[] = [];
        const red: Fleet[] = [];
        if (!!this.battleReport) {
            const userID = this.tokenStorage.getUserID();
            this.battleReport.participatingFleets.forEach(fleet => {
                const idUser = fleet.owner.idUser;
                if (idUser === userID) {
                    green.push(fleet);
                } else {
                    red.push(fleet);
                }
            });
        }
        this.green = green;
        this.red = red;
    }
}

export class CombatArenaData {

    combatRounds: Int8Array;

    movementsByRound: Map<number, MovementAction[]>;

    missileMovementsByRound: Map<number, MissileMovement[]>;

    volleysByRound: Map<number, ReleasedVolley[]>;

    shipKillerHitsByRound: Map<number, ShipKillerHit[]>;

    counterMissileHitsByRound: Map<number, CounterMissileHit[]>;

    hitLogsByRound: Map<number, HitLog[]>;

    shipClasses: ShipClass[];

    constructor(combatRounds: Int8Array,
                movementsByRound: Map<number, MovementAction[]>,
                volleysByRound: Map<number, ReleasedVolley[]>,
                missileMovementsByRound: Map<number, MissileMovement[]>,
                shipKillerHitsByRound: Map<number, ShipKillerHit[]>,
                counterMissileHitsByRound: Map<number, CounterMissileHit[]>,
                hitLogsByRound: Map<number, HitLog[]>,
                shipClasses: ShipClass[]) {
        this.combatRounds = combatRounds;
        this.movementsByRound = movementsByRound;
        this.volleysByRound = volleysByRound;
        this.missileMovementsByRound = missileMovementsByRound;
        this.shipKillerHitsByRound = shipKillerHitsByRound;
        this.counterMissileHitsByRound = counterMissileHitsByRound;
        this.hitLogsByRound = hitLogsByRound;
        this.shipClasses = shipClasses;
    }
}
