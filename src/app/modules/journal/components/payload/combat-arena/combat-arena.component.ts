import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {BattleReport, CounterMissileHit, Fleet, MissileMovement, MovementAction, Planet, ReleasedVolley, ShipKillerHit, StarSystem} from "../../../../../services/swagger";
import {SVG} from "@svgdotjs/svg.js";
import {BattleViewHelper} from "../../../battle-view-helper";
import {BasicViewHelper} from "../../../../../basic-view-helper";

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
                this.createCanvas();
                this.setActiveRound(this.activeRound, this.starSystem, this.canvas!, this.dblClickForFleet);
                let orbit = this.battleReport!.orbit;
                this.setViewBoxByFleetOrbit(orbit);
            }
        }
        if (changes[this.combatArenaDataInputDefinition]) {
            if (!!this.combatArenaData && !!this.starSystem) {
                this.setCombatData(this.combatArenaData);
                this.createCanvas();
                this.setActiveRound(1, this.starSystem, this.canvas!, this.dblClickForFleet);
                let orbit = this.battleReport!.orbit;
                this.setViewBoxByFleetOrbit(orbit);
            } else {
                this.clearCanvas();
            }
        }
    }

    /**
     * call back function for using a click at an element
     *
     * @param event
     */
    private dblClickForFleet = (event: PointerEvent) => {
        let fleet = this.getFleetByEvent(event);
        if (!fleet) {
            let text = this.getFleetTextByEvent(event);
            if (!!text) {
                fleet = this.getFleetByText(text);
            }
        }
        console.log(fleet)
    }

    /**
     * main method of this fuckin' shit - creates everything by the current data
     * @private
     */
    private createStarMap() {
        if (!!this.starSystem) {
            if (!this.canvas) {
                this.createCanvas()
            } else {
                this.clearCanvas();
            }
            this.setOrbits(this.canvas!, this.starSystem);
        } else {
            this.clearCanvas();
        }
    }

    /**
     * necessary to create svg after template is rendered
     * @private
     */
    private createCanvas() {
        if (!this.canvas) {
            this.canvas = SVG().id("combat-arena").addTo('#arena').panZoom(BasicViewHelper.PAN_ZOOM_OPTIONS);
        }
    }

    /**
     * sets up the combat
     */
    private setUpCombat() {
        const green: Fleet[] = [];
        const blue: Fleet[] = [];
        if (!!this.battleReport) {
            const userID = this.tokenStorage.getUserID();
            this.battleReport.participatingFleets.forEach(fleet => {
                const idUser = fleet.owner.idUser;
                if (idUser === userID) {
                    green.push(fleet);
                } else {
                    blue.push(fleet);
                }
            });
        }
        this.green = green;
        this.red = blue;
    }
}

export class CombatArenaData {

    combatRounds: Int8Array;

    movementsByRound: Map<number, MovementAction[]>;

    missileMovementsByRound: Map<number, MissileMovement[]>;

    volleysByRound: Map<number, ReleasedVolley[]>;

    shipKillerHitsByRound: Map<number, ShipKillerHit[]>;

    counterMissileHitsByRound: Map<number, CounterMissileHit[]>;

    constructor(combatRounds: Int8Array,
                movementsByRound: Map<number, MovementAction[]>,
                volleysByRound: Map<number, ReleasedVolley[]>,
                missileMovementsByRound: Map<number, MissileMovement[]>,
                shipKillerHitsByRound: Map<number, ShipKillerHit[]>,
                counterMissileHitsByRound: Map<number, CounterMissileHit[]>) {
        this.combatRounds = combatRounds;
        this.movementsByRound = movementsByRound;
        this.volleysByRound = volleysByRound;
        this.missileMovementsByRound = missileMovementsByRound;
        this.shipKillerHitsByRound = shipKillerHitsByRound;
        this.counterMissileHitsByRound = counterMissileHitsByRound;
    }
}
