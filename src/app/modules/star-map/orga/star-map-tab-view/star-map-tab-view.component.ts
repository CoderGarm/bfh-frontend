import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {StarSystem} from "../../../../services/swagger";
import {MatTabGroup} from "@angular/material/tabs";
import {SubscriptionManager} from "../../../../subscription.manager";
import {StarMapCommunicationService} from "../../../../services/intercom/star-map-communication.service";

@Component({
    selector: 'app-star-map-tab-view',
    templateUrl: './star-map-tab-view.component.html',
    styleUrls: ['./star-map-tab-view.component.scss']
})
export class StarMapTabViewComponent extends SubscriptionManager implements OnInit, OnChanges {

    static path: string = 'star-map';

    @Input()
    starSystemSelectionInput?: StarSystem;
    private starSystemSelectionInputDefinition: string = "starSystemSelectionInput";

    @ViewChild("tabGroup", {static: false})
    tabGroup?: MatTabGroup;

    index?: number;

    constructor(private starMapCommService: StarMapCommunicationService) {
        super();

        let sub = this.starMapCommService.getDisplaySystemEmitter().subscribe(resp => this.run(resp));
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.starSystemSelectionInputDefinition]) {
            if (!!this.tabGroup) {
                this.index = 1;
            }
        }
    }

    run(event: StarSystem) {
        this.starSystemSelectionInput = event;
        this.index = 1;
    }

    indexChanged(event: number) {
        if (event != 1) {
            this.starSystemSelectionInput = undefined;
        }
        this.starMapCommService.clear(event);
    }
}
