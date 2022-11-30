import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {TypeService} from "../../../../../services/type.service";
import {BackgroundService} from "../../../../../services/background.service";

@Component({
    selector: 'app-journal-tab-view',
    templateUrl: './journal-tab-view.component.html',
    styleUrls: ['./journal-tab-view.component.scss']
})
export class JournalTabViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'journal';

    /**
     * @param typeService needed to fetch types after login
     * @param backgroundService needed after run long-running queries after login
     */
    constructor(private typeService: TypeService,
                private backgroundService: BackgroundService) {
        super();
    }

    ngOnInit(): void {
    }

}
