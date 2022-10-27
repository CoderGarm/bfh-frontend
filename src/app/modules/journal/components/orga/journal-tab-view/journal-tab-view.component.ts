import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-journal-tab-view',
    templateUrl: './journal-tab-view.component.html',
    styleUrls: ['./journal-tab-view.component.scss']
})
export class JournalTabViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'journal';

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

}
