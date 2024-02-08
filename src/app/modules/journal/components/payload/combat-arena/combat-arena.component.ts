import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BattleReport, Fleet, Planet, StarSystem} from "../../../../../services/swagger";
import {BattleViewHelper} from "../../../battle-view-helper";
import {CombatArenaData} from "../../../combat-arena-data";
import {Text} from "@svgdotjs/svg.js";

@Component({
    selector: 'app-combat-arena',
    templateUrl: './combat-arena.component.html',
    styleUrls: ['./combat-arena.component.scss']
})
export class CombatArenaComponent extends BattleViewHelper implements AfterViewInit, OnChanges {

    @Input()
    starSystem?: StarSystem;
    private starSystemSelectionInputDefinition: string = "starSystem";

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

    constructor() {
        super()
    }

    ngAfterViewInit(): void {
        this.createCanvas("combat-arena", '#arena');
        this.canvas!
            .on('zoom', this.onZoom)
            .click(this.clickForFleet)
            .mouseover(this.mouseoverForWarship);

        this.getOrCreateMainSubLayerGroup()
            .mouseover(this.mouseoverForEllipse)
            .mouseout(this.mouseoutForEllipse);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes[this.starSystemSelectionInputDefinition]) {
            this.createStarMap();
        }
        if (changes[this.battleReportInputDefinition]) {
            this.setUpCombat();
            this.setBattleReport(this.battleReport);
            this.drawCourses();
        }
        if (changes[this.activeRoundInputDefinition]) {
            this.displayActiveRound();
        }
        if (changes[this.combatArenaDataInputDefinition]) {
            if (!this.combatArenaData && !this.starSystem) {
                this.clearData();
            }
        }
    }

    private displayActiveRound() {
        if (!!this.starSystem) {
            this.setActiveRound(this.activeRound);
            this.setViewBoxByFleetOrbit(this.battleReport!.battleReportStatistics.orbit);
            this.calculateMapScale();
        }
    }

    private createStarMap() {
        this.ngAfterViewInit();
        if (!!this.starSystem) {
            this.drawOrbits(this.starSystem);
        } else {
            this.clearData();
        }
    }

    private onZoom = (ev: any) => {
        this.displayActiveRound();
        this.zoomAuraTexts();
    }

    private zoomAuraTexts() {
        const fontSize = {size: Math.ceil(50000 / Math.max(1, this.zoomScale))};
        const texts = this.getOrCreateMainSubLayerGroup().children()
            .filter(child => child.hasClass(BattleViewHelper.AURA_TEXT_MARKER));
        texts.forEach(element => (<Text>element).font(fontSize));
    }

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
