import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {StarSystem} from "../../../../services/swagger";
import {MatTabGroup} from "@angular/material/tabs";

@Component({
    selector: 'app-star-map-tab-view',
    templateUrl: './star-map-tab-view.component.html',
    styleUrls: ['./star-map-tab-view.component.scss']
})
export class StarMapTabViewComponent implements OnInit, OnChanges {

    static path: string = 'star-map';

    @Input()
    starSystemSelectionInput?: StarSystem;
    private starSystemSelectionInputDefinition: string = "starSystemSelectionInput";

    @ViewChild("tabGroup", {static: false})
    tabGroup?: MatTabGroup;

    index?: number;

    // todo flip y axis from computer display to human readable direction
    constructor() {
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

    run($event: StarSystem) {
        this.starSystemSelectionInput = $event;
        this.index = 1;
    }

    indexChanged(event: number) {
        if (event != 1) {
            this.starSystemSelectionInput = undefined;
        }
    }
}
