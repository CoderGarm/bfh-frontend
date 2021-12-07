import {AfterViewInit, Component, Inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {CapabilityValue, EModuleType, Fleet, FleetCapabilities, ShipyardApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";

@Component({
    selector: 'app-spacecraft-capabilities-display',
    templateUrl: './spacecraft-capabilities-display.component.html',
    styleUrls: ['./spacecraft-capabilities-display.component.scss']
})
export class SpacecraftCapabilitiesDisplayComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * the base data to display
     */
    @Input()
    fleetInput?: Fleet;

    fleetCapabilities?: FleetCapabilities;

    caps: CapabilityValue[] = [];
    private moduleTypes: EModuleType[] = [];
    private moduleTypesMap: Map<EModuleType, string> = new Map<EModuleType, string>();

    /**
     * the constructor
     * @param fleet
     * @param shipYardApi
     */
    constructor(@Optional() @Inject('fleetInput') fleet: Fleet | undefined,
                private shipYardApi: ShipyardApiService) {
        super();
        this.fleetInput = fleet;
        this.fetchModuleTypes();
        this.fetchCaps();
    }

    ngAfterViewInit(): void {
        this.fetchModuleTypes();
    }

    private fetchModuleTypes() {
        let sub = this.shipYardApi.getEModuleTypes().subscribe(resp => {
            this.moduleTypes = resp;
            this.moduleTypesMap.clear();
            resp.forEach(el => this.moduleTypesMap.set(el, el.iconName));
        });
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.fetchCaps();
    }

    private fetchCaps() {
        if (!!this.fleetInput) {
            this.fleetCapabilities = this.fleetInput.fleetCapabilities;
            this.caps = this.fleetCapabilities.capabilities;
        } else {
            this.fleetCapabilities = undefined;
            this.caps = [];
        }
    }

    getLink(cap: CapabilityValue): any {
        let iconName = cap.moduleType.iconName;
        let folder = cap.moduleType.folder;
        // todo check
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }
}
