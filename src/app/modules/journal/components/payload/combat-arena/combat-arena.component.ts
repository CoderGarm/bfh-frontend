import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SystemViewHelper} from "../../../../star-map/payload/SystemViewHelper";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {BattleReport, Fleet, Planet, StarMapApiService, StarSystem} from "../../../../../services/swagger";
import {SVG} from "@svgdotjs/svg.js";

@Component({
    selector: 'app-combat-arena',
    templateUrl: './combat-arena.component.html',
    styleUrls: ['./combat-arena.component.scss']
})
export class CombatArenaComponent extends SystemViewHelper implements AfterViewInit, OnChanges {

    @Input()
    starSystemSelection?: StarSystem;
    private starSystemSelectionInputDefinition: string = "starSystemSelection";

    @Input()
    battleReport?: BattleReport;
    private battleReportInputDefinition: string = "battleReport";

    planets: Planet[] = [];
    private system?: StarSystem;

    blue: Fleet[] = [];
    green: Fleet[] = [];

    constructor(private starMapApi: StarMapApiService,
                tokenStorage: TokenStorage) {
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
    }

    /**
     * main method of this fuckin' shit - creates everything by the current data
     * @private
     */
    private createStarMap() {
        if (!!this.starSystemSelection) {
            this.clearCanvas();
            let sub = this.starMapApi.getStarSystem(this.starSystemSelection.idStarSystem)
                .subscribe(system => {
                    this.system = system;
                    this.planets = system.planets;
                    if (!this.canvas) {
                        this.createCanvas()
                    }
                    this.setOrbits(this.canvas!, system, null);
                });
            this.subscriptions.push(sub);
        } else {
            this.clearCanvas();
        }
    }

    /**
     * necessary to create svg after template is rendered
     * @private
     */
    private createCanvas() {
        this.canvas = SVG().id("combat-arena").addTo('#arena').panZoom();
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
