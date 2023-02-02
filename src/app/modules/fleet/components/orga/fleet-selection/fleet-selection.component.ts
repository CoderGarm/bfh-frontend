import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {Fleet, FleetApiService} from "../../../../../services/swagger";
import {FleetChangeService} from "../../../../../services/fleet-change.service";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-fleet-selection',
    templateUrl: './fleet-selection.component.html',
    styleUrls: ['./fleet-selection.component.scss']
})
export class FleetSelectionComponent extends SubscriptionManager implements AfterViewInit {

    /**
     * all the fleets which are controlled by the logged in user
     */
    fleets: Fleet[] = [];

    /**
     * the user selected fleet
     */
    @Output()
    selectedFleetOutput: EventEmitter<Fleet> = new EventEmitter<Fleet>();

    selectedFleet?: Fleet;

    constructor(private fleetApi: FleetApiService,
                private fleetChangeService: FleetChangeService) {
        super();

        const sub = this.fleetChangeService.nameChange.subscribe(resp => {
            const filter = this.fleets.filter(f => f.idFleet === resp.idFleet);
            if (filter.length == 1) {
                filter[0].name = resp.name;
            }
        });
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
        let sub = this.fleetApi.getFleetsForUser().subscribe(resp => {
            this.fleets = resp;
            this.selectFirst();
        });
        this.subscriptions.push(sub);
    }

    private selectFirst() {
        if (this.fleets.length > 0) {
            this.selectFleet(this.fleets[0]);
        }
    }

    selectFleet(fleet?: Fleet) {
        this.selectedFleetOutput.emit(fleet);
        this.selectedFleet = fleet;
    }
}
