import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BattleReport, Fleet, Planet, StarSystem} from "../../../../../services/swagger";
import {BattleViewHelper} from "../../../battle-view-helper";
import {CombatArenaData} from "../../../combat-arena-data";
import {Text} from "@svgdotjs/svg.js";
import {RadialMenuItem} from "../../../../shared-module/components/radial-menu-component/radial-menu.component";

enum EArenaMenuItem {
    AURA = 'AURA',
    BIZARRO = 'BIZARRO',
    RED_DETAILS = 'RED_DETAILS',
    GREEN_DETAILS = 'GREEN_DETAILS',
}

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

    red?: Fleet;
    green?: Fleet;

    @Input()
    combatArenaData?: CombatArenaData;
    private combatArenaDataInputDefinition: string = "combatArenaData";

    /**
     * The active round will be defined at least - if this is changed, every needed information is present.
     */
    @Input()
    activeRound?: number;
    private activeRoundInputDefinition: string = "activeRound";

    menuItemsModel: RadialMenuItem[] = [];

    protected showRed: boolean = false;
    protected showGreen: boolean = false;

    constructor() {
        super()

        this.menuItemsModel.push({labelKey: "combat-arena.action.show-aura", menuItemKey: EArenaMenuItem.AURA, disabled: false});
        this.menuItemsModel.push({labelKey: "combat-arena.action.show-bizarro", menuItemKey: EArenaMenuItem.BIZARRO, disabled: false});
        this.menuItemsModel.push({labelKey: "combat-arena.action.show-red-details", menuItemKey: EArenaMenuItem.RED_DETAILS, disabled: false});
        this.menuItemsModel.push({labelKey: "combat-arena.action.show-green-details", menuItemKey: EArenaMenuItem.GREEN_DETAILS, disabled: false});
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
        if (!!this.battleReport) {
            this.battleReport.participatingFleets.forEach(fleet => {
                if (fleet.owner.idUser === this.userId) {
                    this.green = fleet;
                } else {
                    this.red = fleet;
                }
            });
        }
    }

    menuClicked(event: RadialMenuItem) {
        switch (<EArenaMenuItem><unknown>event.menuItemKey) {
            case EArenaMenuItem.AURA:
                this.showAura = !this.showAura;
                break;
            case EArenaMenuItem.BIZARRO:
                this.showBizarrometer = !this.showBizarrometer;
                break;
            case EArenaMenuItem.RED_DETAILS:
                this.showRed = !this.showRed;
                break;
            case EArenaMenuItem.GREEN_DETAILS:
                this.showGreen = !this.showGreen;
                break;

        }
        this.displayActiveRound();
    }
}
