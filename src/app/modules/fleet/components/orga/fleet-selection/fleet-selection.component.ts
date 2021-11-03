import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {Subscription} from "rxjs";
import {Fleet, FleetApiService} from "../../../../../services/swagger";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";

@Component({
    selector: 'app-fleet-selection',
    templateUrl: './fleet-selection.component.html',
    styleUrls: ['./fleet-selection.component.scss']
})
export class FleetSelectionComponent implements AfterViewInit {

    private subscriptions: Subscription[] = [];

    /**
     * all the fleets which are controlled by the logged in user
     */
    fleets: Fleet[] = [];

    /**
     * the user selected fleet
     */
    @Output()
    selectedFleetOutput: EventEmitter<Fleet> = new EventEmitter<Fleet>();

    constructor(private fleetApi: FleetApiService, private tokenStorage: TokenStorage) {
    }

    ngAfterViewInit(): void {
        let userID = this.tokenStorage.getUserID();
        if (!!userID) {
            let sub = this.fleetApi.getFleetsForUser(userID).subscribe(resp => this.fleets = resp);
            this.subscriptions.push(sub);
        }
    }

    selectFleet(fleet?: Fleet) {
        this.selectedFleetOutput.emit(fleet);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

}
