import {AfterViewInit, Component, Inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../SubscriptionManager";
import {Fleet} from "../../../services/swagger";

@Component({
    selector: 'app-fleet-merge-edit',
    templateUrl: './fleet-merge-edit.component.html',
    styleUrls: ['./fleet-merge-edit.component.scss']
})
export class FleetMergeEditComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * the fleet which will take all the other war ships
     */
    @Input()
    fleetSubject?: Fleet;
    fleetSubjectDefinition: string = "fleetSubject";

    /**
     * the fleet which will loose all war ships to the subject's fleet and will be disbanded
     */
    @Input()
    fleetObject?: Fleet;
    fleetObjectDefinition: string = "fleetObject";

    constructor(@Optional() @Inject('fleetSubject') fleetSubject: Fleet | undefined,
                @Optional() @Inject('fleetObject') fleetObject: Fleet | undefined,) {
        super();
        this.fleetSubject = fleetSubject;
        this.fleetObject = fleetObject;
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetSubjectDefinition]) {

        }
        if (changes[this.fleetObjectDefinition]) {

        }
    }
}
