import {AfterViewInit, Component} from '@angular/core';
import {ShipClass, ShipyardApiService} from "../../../../../services/swagger";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {NavigationCreationService} from "../../../../../services/navigation/navigation-creation.service";
import {ShipyardEventService} from "../../../shipyard-event.service";
import {SidenavSelectionManager} from "../../../../../sidenav-selection-manager";

@Component({
    selector: 'app-ship-class-selection',
    templateUrl: './ship-class-selection.component.html',
    styleUrls: ['./ship-class-selection.component.scss']
})
export class ShipClassSelectionComponent extends SidenavSelectionManager implements AfterViewInit {

    shipClasses: ShipClass[] = [];

    selectedClass?: ShipClass;

    constructor(private tokenService: TokenStorage,
                private shipyardService: ShipyardEventService,
                private shipyardApi: ShipyardApiService) {
        super(NavigationCreationService.getShipYardRoute());

        let sub = this.shipyardService.getModifiedShipClassEmitter().subscribe(shipClass => {
            this.fetchShipClasses();
            setTimeout(() => {
                this.selectClass(shipClass);
            }, 200);
        });
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
        this.fetchShipClasses();
    }

    /**
     * fetches all ship classes for the given user
     * @private
     */
    private fetchShipClasses() {
        let sub = this.shipyardApi.getShipClassesByUser().subscribe(resp => this.shipClasses = resp);
        this.subscriptions.push(sub);
    }

    selectClass(shipClass?: ShipClass) {
        this.navService.navigate(NavigationCreationService.getShipYardRoute());
        this.shipyardService.selectShipClass(shipClass);
        if (!!shipClass) {
            this.selectedItem = {
                id: shipClass.idShipClass!
            };
        } else {
            this.selectedClass = undefined;
        }
    }
}
