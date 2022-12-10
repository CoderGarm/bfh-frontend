import {AfterViewInit, Component, Inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../SubscriptionManager";
import {Fleet, FleetApiService, FleetMarker} from "../../../services/swagger";

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
    fleetSubject?: Fleet; // please note that the missing type-safetyness of javascript allows it to use a FleetMarker here
    fleetSubjectDefinition: string = "fleetSubject";

    /**
     * the fleet which will lose all war ships to the subject's fleet and will be disbanded
     */
    @Input()
    fleetObject?: Fleet; // please note that the missing type-safetyness of javascript allows it to use a FleetMarker here
    fleetObjectDefinition: string = "fleetObject";

    constructor(@Optional() @Inject('fleetSubject') fleetSubject: Fleet | FleetMarker | undefined,
                @Optional() @Inject('fleetObject') fleetObject: Fleet | FleetMarker | undefined,
                private fleetService: FleetApiService) {
        super();

        this.fetchSubject(fleetSubject);
        this.fetchObject(fleetObject);
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetSubjectDefinition]) {
            this.fetchSubject(changes[this.fleetSubjectDefinition].currentValue);
        }
        if (changes[this.fleetObjectDefinition]) {
            this.fetchObject(changes[this.fleetObjectDefinition].currentValue);
        }
    }

    private fetchSubject(fleetSubject: Fleet | FleetMarker | undefined) {
        if (!fleetSubject) {
            return;
        }
        if ('idFleet' in fleetSubject) {
            this.fleetSubject = fleetSubject;
            return;
        }
        if ('fleet' in fleetSubject) {
            const sub = this.fleetService.getFleet(fleetSubject.fleet.id).subscribe(resp => this.fleetSubject = resp);
            this.subscriptions.push(sub);
        }
    }

    private fetchObject(fleetObject: Fleet | FleetMarker | undefined) {
        if (!fleetObject) {
            return;
        }
        if ('idFleet' in fleetObject) {
            this.fleetObject = fleetObject;
            return;
        }
        if ('fleet' in fleetObject) {
            const sub = this.fleetService.getFleet(fleetObject.fleet.id).subscribe(resp => this.fleetObject = resp);
            this.subscriptions.push(sub);
        }
    }
}
