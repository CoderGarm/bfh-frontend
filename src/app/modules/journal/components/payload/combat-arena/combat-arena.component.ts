import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {BattleReport, Distance, Fleet, Move, MovementAction, Orbit, Planet, ReleasedVolley, StarSystem} from "../../../../../services/swagger";
import {SVG} from "@svgdotjs/svg.js";
import {BattleViewHelper} from "../../../battle-view-helper";
import {NavigationCalculator} from "../../../../../NavigationCalculator";

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

    blue: Fleet[] = [];
    green: Fleet[] = [];

    @Input()
    combatArenaData?: CombatArenaData;
    private combatArenaDataInputDefinition: string = "combatArenaData";

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
        }
        if (changes[this.activeRoundInputDefinition]) {
            if (!!this.starSystem) {
                this.createCanvas();
                this.setActiveRound(this.activeRound, this.starSystem, this.canvas!, this.dblClickForFleet);
            }
        }
        if (changes[this.combatArenaDataInputDefinition]) {
            if (!!this.combatArenaData && !!this.starSystem) {
                const combatRounds = this.combatArenaData.combatRounds.sort();
                const movementsByRound = this.combatArenaData.movementsByRound;
                const volleysByRound = this.combatArenaData.volleysByRound;
                const lastRound = combatRounds[combatRounds.length - 1];
                combatRounds.forEach(round => {
                    const moveMap: Map<Move, Fleet[]> = new Map<Move, Fleet[]>();
                    const movements: Map<Fleet, MovementAction> | undefined = movementsByRound.get(round);
                    if (!movements) {
                        return;
                    }
                    movements?.forEach((movement, fleet) => {
                        Array.from(moveMap.values())
                            .forEach(knownFleets => knownFleets
                                .forEach(knownFleet => {
                                    if (knownFleet.idFleet === fleet.idFleet) {
                                        return;
                                    }
                                }));
                        const move = this.createMove(fleet, lastRound, movement);
                        fleet.move = move;
                        moveMap.set(move, [fleet]);
                    });
                    this.addMovementPerRound(round, moveMap);
                }); // todo put moves for every round in the map
                this.createCanvas();
                this.setActiveRound(1, this.starSystem, this.canvas!, this.dblClickForFleet);
            } else {
                this.clearCanvas();
            }
        }
    }

    private createMove(fleet: Fleet, lastRound: number, movement: MovementAction) {
        const venue = this.battleReport?.orbit;
        const xCoordinate = venue!.orbit!.xCoordinate;
        const yCoordinate = venue!.orbit!.yCoordinate;
        const move: Move = {
            idFleetInMotion: fleet.idFleet,
            moveDoneAtZero: lastRound,
            originalDuration: lastRound,
            targetOrbit: {
                system: this.starSystem,
                orbit: {
                    xCoordinate: {
                        coordinate: xCoordinate.coordinate + NavigationCalculator.convertDistanceToMetric(movement.destination.xCoordinate, xCoordinate.distanceMetric),
                        distanceMetric: xCoordinate.distanceMetric
                    },
                    yCoordinate: {
                        coordinate: yCoordinate.coordinate + NavigationCalculator.convertDistanceToMetric(movement.destination.yCoordinate, yCoordinate.distanceMetric),
                        distanceMetric: yCoordinate.distanceMetric
                    }
                }
            },
            startOrbit: {
                system: this.starSystem,
                orbit: {
                    xCoordinate: {
                        coordinate: xCoordinate.coordinate + NavigationCalculator.convertDistanceToMetric(movement.origin.xCoordinate, xCoordinate.distanceMetric),
                        distanceMetric: xCoordinate.distanceMetric
                    },
                    yCoordinate: {
                        coordinate: yCoordinate.coordinate + NavigationCalculator.convertDistanceToMetric(movement.origin.yCoordinate, yCoordinate.distanceMetric),
                        distanceMetric: yCoordinate.distanceMetric
                    }
                }
            }
        }
        return move;
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
     * drag end callback for a dragged fleet to another fleet or an orbit
     *
     * @param draggedFleet the moved fleet
     * @param targetFleet the destination if it is another fleet
     * @param orbit the destination if it is an orbit
     */
    private dragEndForFleet = (draggedFleet?: Fleet, targetFleet?: Fleet, orbit?: Orbit) => {
        // noop
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
            this.canvas = SVG().id("combat-arena").addTo('#arena').panZoom();
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
        this.blue = blue;
    }
}

export class CombatArenaData {

    combatRounds: number[] = [];

    movementsByRound: Map<number, Map<Fleet, MovementAction>> = new Map<number, Map<Fleet, MovementAction>>();

    volleysByRound: Map<number, Map<Fleet, ReleasedVolley>> = new Map<number, Map<Fleet, ReleasedVolley>>();


    constructor(combatRounds: number[],
                movementsByRound: Map<number, Map<Fleet, MovementAction>>,
                volleysByRound: Map<number, Map<Fleet, ReleasedVolley>>) {
        this.combatRounds = combatRounds;
        this.movementsByRound = movementsByRound;
        this.volleysByRound = volleysByRound;
    }
}
