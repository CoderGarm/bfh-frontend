import {AfterViewInit, Component, Input} from '@angular/core';
import {ShipClass} from "../../../services/swagger";

@Component({
    selector: 'app-ship-class-build',
    templateUrl: './ship-class-build.component.html',
    styleUrls: ['./ship-class-build.component.scss']
})
export class ShipClassBuildComponent implements AfterViewInit {

    /**
     * the construction which should be displayed
     */
    @Input()
    shipClassInput!: ShipClass;

    constructor() {
    }

    ngAfterViewInit() {
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(): string { // todo check all of these string to enum changes
        let folder = this.shipClassInput.hull.hullType.folder;
        let iconName = this.shipClassInput.hull.hullType.iconName;
        //todo check
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }
}
