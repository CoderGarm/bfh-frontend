import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Hull} from "../../../services/swagger";
import {DataSource} from "@angular/cdk/collections";
import {Observable, ReplaySubject} from "rxjs";

@Component({
    selector: 'app-hull-display',
    templateUrl: './hull-display.component.html',
    styleUrls: ['./hull-display.component.scss']
})
export class HullDisplayComponent implements OnInit, OnChanges {

    displayedColumns: string[] = ['occ', 'cc', 'ccbow', 'ccbraodsides', 'ccstern'];

    dataSource = new HullDataSource([]);

    /**
     * the hull which should be displayed
     */
    @Input()
    hullInput!: Hull;
    private hullInputDefinition = "hullInput";

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.hullInputDefinition]) {
            this.dataSource.setData([this.hullInput])
        }
    }

}

class HullDataSource extends DataSource<Hull> {
    private _dataStream = new ReplaySubject<Hull[]>();

    constructor(initialData: Hull[]) {
        super();
        this.setData(initialData);
    }

    connect(): Observable<Hull[]> {
        return this._dataStream;
    }

    disconnect() {
    }

    setData(data: Hull[]) {
        this._dataStream.next(data);
    }
}
