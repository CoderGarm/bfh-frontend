import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Alliance, AllianceApiService, UserJson} from "../../../../../services/swagger";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-members-list',
    templateUrl: './members-list.component.html',
    styleUrls: ['./members-list.component.scss']
})
export class MembersListComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    alliance?: Alliance;
    allianceDefinition: string = 'alliance';

    displayedColumns: string[] = ['name'];

    members: UserJson[] = [];

    dataSource = new MatTableDataSource<UserJson>(this.members);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort?: MatSort;

    constructor(private allianceApi: AllianceApiService) {
        super();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes[this.allianceDefinition]) {
            this.reload();
        }
    }

    private reload() {
        if (!this.alliance) {
            return;
        }
        let sub = this.allianceApi.getMembers(this.alliance.idAlliance).subscribe(resp => {
            this.members = resp;
            this.dataSource.data = this.members;
        });
        this.subscriptions.push(sub);

        if (!!this.paginator) {
            this.dataSource.paginator = this.paginator;
        }
        if (!!this.sort) {
            this.dataSource.sort = this.sort;
        }
    }
}
