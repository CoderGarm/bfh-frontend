import {Component, Input, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {Planet, StarSystem} from "../../../../services/swagger";

@Component({
    selector: 'app-system-info',
    templateUrl: './system-info.component.html',
    styleUrls: ['./system-info.component.scss']
})
export class SystemInfoComponent extends SubscriptionManager implements OnInit {

    @Input()
    starSystem?: StarSystem;

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

    getColonized(): Planet[] {
        if (!this.starSystem) {
            return [];
        }
        return this.starSystem.planets.filter(p => !!p.owner);
    }
}
