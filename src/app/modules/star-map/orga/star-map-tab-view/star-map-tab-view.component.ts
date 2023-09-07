import {Component, OnInit, ViewChild} from '@angular/core';
import {StarSystem} from "../../../../services/swagger";
import {MatTabGroup} from "@angular/material/tabs";
import {SubscriptionManager} from "../../../../subscription.manager";
import {StarMapCommunicationService} from "../../../../services/intercom/star-map-communication.service";

@Component({
    selector: 'app-star-map-tab-view',
    templateUrl: './star-map-tab-view.component.html',
    styleUrls: ['./star-map-tab-view.component.scss']
})
export class StarMapTabViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'star-map';


    starSystemSelectionInput?: StarSystem;

    @ViewChild("tabGroup", {static: false})
    tabGroup?: MatTabGroup;

    index?: number;

    constructor(private starMapCommService: StarMapCommunicationService) {
        super();

        let sub = this.starMapCommService.getDisplaySystemEmitter().subscribe(resp => this.setSystemAndSwitchTab(resp));
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
    }

    setSystemAndSwitchTab(event: StarSystem) {
        this.starSystemSelectionInput = event;
        this.index = 1;
    }
}
