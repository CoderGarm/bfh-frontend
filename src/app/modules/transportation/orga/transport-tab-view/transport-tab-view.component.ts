import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-transport-tab-view',
    templateUrl: './transport-tab-view.component.html',
    styleUrls: ['./transport-tab-view.component.scss']
})
export class TransportTabViewComponent implements OnInit {

    static path: string = 'transportation';

    constructor() {
    }

    ngOnInit(): void {
    }

}
