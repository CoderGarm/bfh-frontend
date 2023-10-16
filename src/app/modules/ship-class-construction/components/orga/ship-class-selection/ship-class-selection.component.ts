import {AfterViewInit, Component} from '@angular/core';
import {ShipClass} from "../../../../../services/swagger";
import {NavigationCreationService} from "../../../../../services/navigation/navigation-creation.service";
import {ShipyardEventService} from "../../../shipyard-event.service";
import {SidenavSelectionManager} from "../../../../../sidenav-selection-manager";
import {ModuleService} from "../../../../../services/prefetch/module.service";

@Component({
    selector: 'app-ship-class-selection',
    templateUrl: './ship-class-selection.component.html',
    styleUrls: ['./ship-class-selection.component.scss']
})
export class ShipClassSelectionComponent extends SidenavSelectionManager implements AfterViewInit {

    shipClasses: ShipClass[] = [];

    selectedClass?: ShipClass;

    constructor(private shipyardService: ShipyardEventService,
                private moduleService: ModuleService) {
        super(NavigationCreationService.getShipYardRoute());

        let sub = this.shipyardService.getModifiedShipClassEmitter().subscribe(shipClass => {
            this.moduleService.fetchShipClasses();
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
        let sub = this.moduleService.getShipClassesByUser().subscribe(resp => this.shipClasses = resp);
        this.subscriptions.push(sub);
    }

    selectClass(shipClass?: ShipClass) {
        if (!!shipClass) {
            this.navService.navigate(NavigationCreationService.getShipYardRoute());
            this.shipyardService.selectShipClass(shipClass);
            this.selectedItem = {
                id: shipClass.idShipClass!
            };
        } else {
            this.selectedClass = undefined;
            this.navService.navigate(NavigationCreationService.getShipYardCreateRoute());
        }
    }
}
