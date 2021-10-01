import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {StarSystem} from "../../../services/swagger";
import {MatTabGroup} from "@angular/material/tabs";

@Component({
    selector: 'app-star-map',
    templateUrl: './star-map.component.html',
    styleUrls: ['./star-map.component.scss']
})
export class StarMapComponent implements OnInit, OnChanges {

    static path: string = 'star-map';

    actionTabTitles: string[] = ['Universe map', 'Star system map'];

    @Input()
    starSystemSelectionInput?: StarSystem;
    private starSystemSelectionInputDefinition: string = "starSystemSelectionInput";

    @ViewChild("tabGroup", {static: false})
    tabGroup?: MatTabGroup;

    index?: number;

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
}
