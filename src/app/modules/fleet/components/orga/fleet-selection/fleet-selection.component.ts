import {AfterViewInit, Component} from '@angular/core';
import {AbstractId, FleetApiService} from "../../../../../services/swagger";
import {FleetEventService} from "../../../../../services/intercom/fleet-event.service";
import {NavigationCreationService} from "../../../../../services/navigation/navigation-creation.service";
import {SidenavSelectionManager} from "../../../../../sidenav-selection-manager";

@Component({
    selector: 'app-fleet-selection',
    templateUrl: './fleet-selection.component.html',
    styleUrls: ['./fleet-selection.component.scss']
})
export class FleetSelectionComponent extends SidenavSelectionManager implements AfterViewInit {

    fleets: AbstractId[] = [];

    constructor(private fleetApi: FleetApiService,
                private fleetEventService: FleetEventService) {
        super(NavigationCreationService.getPlanetRoute());

        let sub = this.fleetEventService.getNameChangeEmitter().subscribe(resp => {
            const filter = this.fleets.filter(f => f.id === resp.id);
            if (filter.length == 1) {
                filter[0].name = resp.name;
            }
            if (filter.length === 0) {
                this.fleets.push({
                    id: resp.id,
                    name: resp.name
                });
            }
        });
        this.subscriptions.push(sub);

        sub = this.fleetEventService.getRetireFleetEmitter().subscribe(fleet => {
            const filter = this.fleets.filter(f => f.id === fleet.id);
            if (filter.length == 1) {
                const indexOf = this.fleets.indexOf(filter[0]);
                this.fleets.splice(indexOf, 1);
            }
        });
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
        let sub = this.fleetApi.getFleetsForUser().subscribe(resp => this.fleets = resp);
        this.subscriptions.push(sub);
    }

    selectFleet(fleet: AbstractId) {
        this.navService.navigate(NavigationCreationService.getFleetRoute());
        this.fleetEventService.selectFleet(fleet);
        this.selectedItem = {
            id: fleet.id
        };
    }
}
