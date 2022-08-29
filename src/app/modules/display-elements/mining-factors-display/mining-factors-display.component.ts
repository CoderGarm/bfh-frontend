import {AfterViewInit, Component, Inject, Input, Optional} from '@angular/core';
import {SubscriptionManager} from "../../../SubscriptionManager";
import {MiningFactors, ResourceAmount} from "../../../services/swagger";

@Component({
    selector: 'app-mining-factors-display',
    templateUrl: './mining-factors-display.component.html',
    styleUrls: ['./mining-factors-display.component.scss']
})
export class MiningFactorsDisplayComponent extends SubscriptionManager implements AfterViewInit {

    @Input()
    miningFactors?: MiningFactors;

    constructor(@Optional() @Inject('miningFactors') miningFactors: MiningFactors) {
        super();
        this.miningFactors = miningFactors;
    }

    ngAfterViewInit(): void {
    }

    /**
     * constructs and returns the url to the icon
     * @param cap
     */
    getLink(cap: ResourceAmount): string {
        let folder = cap.resourceType.folder;
        let iconName = cap.resourceType.iconName;
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }

    // todo mining factors wie resource display?

    getAsString(amount: number) {
        return "0." + amount;
    }
}
