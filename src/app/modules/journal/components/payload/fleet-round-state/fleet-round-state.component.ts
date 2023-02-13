import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractId, CapabilityValue, EHullType, Fleet, FleetMarker, HitLog, SpacecraftCapabilities, WarShip} from "../../../../../services/swagger";
import {TranslateService} from "@ngx-translate/core";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {CombatArenaData} from "../../../combat-arena-data";

export interface StateByRound {
    round: number;
    warship: WarShip;
    state: SpacecraftCapabilities;
    alive: boolean;
    fightingCapable: boolean;
}


@Component({
    selector: 'app-fleet-round-state',
    templateUrl: './fleet-round-state.component.html',
    styleUrls: ['./fleet-round-state.component.scss']
})
export class FleetRoundStateComponent extends SubscriptionManager implements OnInit, OnChanges {

    /**
     * the fleet to display
     */
    @Input()
    fleet?: Fleet;
    fleetInputDefinition: string = "fleet";

    @Input()
    combatArenaData?: CombatArenaData;
    private combatArenaDataInputDefinition: string = "combatArenaData";

    @Input()
    activeRound?: number;
    private activeRoundInputDefinition: string = "activeRound";

    @Input()
    hoveredWarship?: AbstractId;

    @Input()
    clickedFleet?: FleetMarker;

    private hullTypes: Map<string, EHullType> = new Map<string, EHullType>();
    warShips: WarShip[] = [];

    private statesByRound: StateByRound[] = [];

    translations: Map<string, string> = new Map<string, string>();

    constructor(private translate: TranslateService) {
        super();

        this.translations.set('combat-arena.tooltip.warship-state.destroyed', 'combat-arena.tooltip.warship-state.destroyed');
        let sub = this.translate.get('combat-arena.tooltip.warship-state.destroyed').subscribe((translated: string) => {
            this.translations.set('combat-arena.tooltip.warship-state.destroyed', translated);
        });
        this.subscriptions.push(sub);
        this.translations.set('combat-arena.tooltip.warship-state.incapacitated', 'combat-arena.tooltip.warship-state.incapacitated');
        sub = this.translate.get('combat-arena.tooltip.warship-state.incapacitated').subscribe((translated: string) => {
            this.translations.set('combat-arena.tooltip.warship-state.incapacitated', translated);
        });
        this.subscriptions.push(sub);
        this.translations.set('combat-arena.tooltip.warship-state.active', 'combat-arena.tooltip.warship-state.active');
        sub = this.translate.get('combat-arena.tooltip.warship-state.active').subscribe((translated: string) => {
            this.translations.set('combat-arena.tooltip.warship-state.active', translated);
        });
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        const isRelevantChange = changes[this.fleetInputDefinition] || changes[this.combatArenaDataInputDefinition];
        const isDataPresent = !!this.fleet && !!this.combatArenaData;
        if (isRelevantChange && isDataPresent) {
            // build base data by given fleet
            this.warShips = [];
            this.hullTypes.clear();
            this.statesByRound = [];

            this.warShips = this.fleet!.ships;
            this.warShips.forEach(warShip => this.createInitialState(warShip));

            // build states by round based on the fleet data and fill up the rounds without action
            let lastRound = this.combatArenaData!.combatRounds[this.combatArenaData!.combatRounds.length - 1];
            let warshipIds = this.statesByRound.filter(state => state.round == 1).map(state => state.warship.idWarship);
            for (let round = 2; round <= lastRound; round++) {
                let hitLogs = this.combatArenaData?.hitLogsByRound?.get(round);
                warshipIds.forEach(idWarship => this.stateWarshipByRound(hitLogs, idWarship, round));
            }
        }
    }

    private stateWarshipByRound(hitLogs: HitLog[] | undefined, idWarship: number, round: number) {
        let hits = hitLogs?.filter(hitLog => hitLog.warShip.id == idWarship);
        const lastRound = round - 1;
        let thisStates = this.statesByRound.filter(state => state.round == round && state.warship.idWarship == idWarship);
        let lastStates = this.statesByRound.filter(state => state.round == lastRound && state.warship.idWarship == idWarship);

        let thisState: StateByRound;
        const hitsPresent = !!hits && hits.length > 0;
        const lastPresent = !!lastStates && lastStates.length == 1;
        const thisPresent = !!thisStates && thisStates.length == 1;
        if (lastPresent && !thisPresent) {
            // just clone for current round - state if not present
            let lastStateByRound = lastStates[0];
            thisState = this.cloneState(round, lastStateByRound);
            this.statesByRound.push(thisState);
        } else {
            // take the known one
            thisState = thisStates[0];
        }

        if (hitsPresent) {
            this.applyHits(hits!, thisState);
        }
    }

    private cloneState(round: number, lastStateByRound: StateByRound) {
        return {
            round: round,
            warship: lastStateByRound.warship,
            state: {
                capabilities: this.deepCloneSpacecraftCapabilities(lastStateByRound.state.capabilities)
            },
            alive: lastStateByRound.alive,
            fightingCapable: lastStateByRound.fightingCapable
        }
    }

    private applyHits(hits: HitLog[], thisState: StateByRound) {
        hits.forEach(hitLog => {
            this.applyDamage(hitLog, thisState);
            this.setHealthState(thisState, hitLog);
        });
    }

    private setHealthState(thisState: StateByRound, hitLog: HitLog) {
        const isAlive = thisState.alive;
        if (isAlive) {
            thisState.alive = hitLog.isAlive;
        }
        const isFightingCapable = thisState.fightingCapable;
        if (isFightingCapable) {
            thisState.fightingCapable = hitLog.isFightingCapable;
        }
    }

    private createInitialState(warShip: WarShip) {
        let hullType = warShip.shipClass.hull.hullType;
        this.hullTypes.set(hullType.typeName, hullType);
        let capabilityValues = this.deepCloneSpacecraftCapabilities(warShip.warshipHealthState.spacecraftCapabilities.capabilities);
        const state: StateByRound = {
            round: 1,
            warship: warShip,
            state: {
                capabilities: capabilityValues
            },
            alive: true,
            fightingCapable: true
        }
        this.statesByRound.push(state);
    }

    private applyDamage(hitLog: HitLog, state: StateByRound) {
        let attackedTypeName: string;
        let remainingValue = hitLog.state;
        switch (hitLog.attackedPart) {
            case "ARMOR":
                attackedTypeName = "ARMOR"
                break;
            case "ELOKA":
                attackedTypeName = "ELECTRONIC_WARFARE"
                break;
            case "FITTING_AND_HULL":
                attackedTypeName = "WEAPON"
                break;
            case "PROPULSION":
                attackedTypeName = "PROPULSION"
                break;
            case "SIDEWALL":
                attackedTypeName = "SIDEWALL"
                break;
            default:
                return;
        }

        let attackedType = state.state.capabilities.filter(cap => cap.moduleType.typeName == attackedTypeName)[0];
        attackedType.value = remainingValue;
    }

    private deepCloneSpacecraftCapabilities(capabilities: CapabilityValue[]): CapabilityValue[] {
        return capabilities.map(c => {
            // deep clone capabilities
            const cap: CapabilityValue = {
                value: c.value,
                moduleType: c.moduleType
            };
            return cap;
        });
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(typeName: string): string {
        const hullType = this.hullTypes.get(typeName);
        let folder = hullType!.folder;
        let iconName = hullType!.iconName;
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }

    getCapsForWarship(warShip: WarShip) {
        return warShip.shipClass.shipClassCapabilities;
    }

    getTitle() {
        if (!this.fleet) {
            return "";
        }
        return this.fleet.owner.username + " - " + this.fleet.name;
    }

    getCurrentWarshipState(warShip: WarShip): StateByRound | undefined {
        const states = this.statesByRound.filter(state => state.round === this.activeRound && state.warship.idWarship === warShip.idWarship);
        if (!!states && states.length == 1) {
            return states[0];
        }
        return undefined;
    }

    getCurrentWarshipSpacecraftCapabilities(warShip: WarShip): SpacecraftCapabilities | undefined {
        const state = this.getCurrentWarshipState(warShip);
        if (!!state) {
            return state.state;
        }
        return undefined;
    }

    getCurrentWarshipIsFightingCapable(warShip: WarShip): boolean | undefined {
        const state = this.getCurrentWarshipState(warShip);
        if (!!state) {
            return state.fightingCapable;
        }
        return undefined;
    }

    getStateClass(state?: StateByRound) {
        if (!!state) {
            if (!state.alive) {
                return "dead has-hit";
            }
            if (!state.fightingCapable) {
                return "unable has-hit";
            }
        }
        return "";
    }

    getShipIconTooltip(warShip: WarShip) {
        let state = this.getCurrentWarshipState(warShip);
        if (!!state) {
            if (!state.alive) {
                return this.translations.get('combat-arena.tooltip.warship-state.destroyed')!;
            }
            if (!state.fightingCapable) {
                return this.translations.get('combat-arena.tooltip.warship-state.incapacitated')!;
            }
        }
        return this.translations.get('combat-arena.tooltip.warship-state.active')!;
    }

    isWarshipHovered(warShip: WarShip) {
        return !!this.hoveredWarship && this.hoveredWarship.id === warShip.idWarship;
    }

    hoveredWarshipClass(warShip: WarShip) {
        const isHovered = this.isWarshipHovered(warShip);
        if (isHovered) {
            return "highlight"
        }
        return "";
    }

    isFleetClicked() {
        return !!this.clickedFleet && !!this.fleet && this.clickedFleet.fleet.id === this.fleet.idFleet;
    }

    clickedFleetClass() {
        const isHovered = this.isFleetClicked();
        if (isHovered) {
            return "highlight"
        }
        return "";
    }
}