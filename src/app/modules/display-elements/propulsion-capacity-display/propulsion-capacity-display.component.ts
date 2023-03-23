import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {PropulsionCapacity, ShipClass, ShipClassMock, ShipyardApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {ShipClassHelper} from "../../ship-class-construction/components/payload/ship-class.helper";

@Component({
    selector: 'app-propulsion-capacity-display',
    templateUrl: './propulsion-capacity-display.component.html',
    styleUrls: ['./propulsion-capacity-display.component.scss']
})
export class PropulsionCapacityDisplayComponent extends SubscriptionManager implements OnChanges {

    displayedColumns: string[] = ['hyperBand', 'timeToVMax', 'acceleration', 'velocity'];

    @Input()
    shipClass?: ShipClass | ShipClassMock;

    @Input()
    capacities: PropulsionCapacity[] = [];

    // @formatter:off
    @Input()
    get streamlineBackground() { return this._streamlineBackground; }
    set streamlineBackground(value: any) { this._streamlineBackground = this.coerceBooleanProperty(value); }
    _streamlineBackground: boolean = false;
    // @formatter:on

    private propulsionCapacityCache: Map<string, PropulsionCapacity[]> = new Map<string, PropulsionCapacity[]>();

    constructor(private shipyardApi: ShipyardApiService) {
        super();
    }

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!!this.shipClass) {
            this.getPropulsionCapacity();
        }
        if (!!this.capacities) {
            this.capacities = this.setCaps(this.capacities);
        }
    }

    private getPropulsionCapacity() {
        if (!!this.shipClass) {
            const pseudoHash = ShipClassHelper.generateFittingPseudoHash(this.shipClass);
            const idPropulsion = this.shipClass.propulsion.baseModule.idModule;
            const key = pseudoHash + 'p' + idPropulsion;
            const propulsionCapacities = this.propulsionCapacityCache.get(key);
            if (!!propulsionCapacities) {
                this.capacities = this.setCaps(propulsionCapacities);
            }
            let sub = this.shipyardApi.getPropulsionCapacity(this.shipClass, idPropulsion).subscribe(resp => {
                this.propulsionCapacityCache.set(key, resp);
                this.capacities = this.setCaps(resp);
            })
            this.subscriptions.push(sub);
        }
    }

    private setCaps(capacities: PropulsionCapacity[]): PropulsionCapacity[] {
        return capacities.filter(e => e.timeToVMax.coordinate > 0);
    }
}
