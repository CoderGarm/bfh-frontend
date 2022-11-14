import {Component, OnInit} from '@angular/core';
import {ResourceEmitterService} from "../../../../../services/resource-emitter.service";

@Component({
    selector: 'app-expansion-tab-view',
    templateUrl: './expansion-tab-view.component.html',
    styleUrls: ['./expansion-tab-view.component.scss']
})
export class ExpansionTabViewComponent implements OnInit {

    static path: string = 'colonization';

    constructor(private resourceEmitter: ResourceEmitterService) {
    }

    ngOnInit(): void {
    }

    indexChanged(event: number) {
        this.resourceEmitter.clear();
    }
}
