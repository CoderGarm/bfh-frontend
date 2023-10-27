import {Component} from '@angular/core';
import {StarSystem} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../subscription.manager";
import {StarMapCommunicationService} from "../../../../services/intercom/star-map-communication.service";

@Component({
    selector: 'app-star-map-tab-view',
    templateUrl: './star-map-tab-view.component.html',
    styleUrls: ['./star-map-tab-view.component.scss']
})
export class StarMapTabViewComponent extends SubscriptionManager {

    static path: string = 'star-map';

    starSystemSelectionInput?: StarSystem;

    index: number = 0;

    constructor(private starMapCommService: StarMapCommunicationService) {
        super();

        let sub = this.starMapCommService.getDisplaySystemEmitter().subscribe(resp => this.setSystemAndSwitchTab(resp));
        this.subscriptions.push(sub);
    }

    setSystemAndSwitchTab(event: StarSystem) {
        this.starSystemSelectionInput = event;
        this.index = 1;
    }
}
