import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {Alliance, AllianceApiService, UserJson} from "../../../../../services/swagger";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
    selector: 'app-alliance-dashboard',
    templateUrl: './alliance-dashboard.component.html',
    styleUrls: ['./alliance-dashboard.component.scss']
})
export class AllianceDashboardComponent extends SubscriptionManager implements OnInit {

    @Input()
    alliance?: Alliance;

    displayedColumns: string[] = ['name', 'grant-application', 'deny-application'];

    applicants: UserJson[] = [];

    dataSource = new MatTableDataSource<UserJson>(this.applicants);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort?: MatSort;

    constructor(private allianceApi: AllianceApiService) {
        super();
    }

    ngOnInit(): void {
        this.reload();
    }

    private reload() {
        let sub = this.allianceApi.getApplicationsForMembership().subscribe(resp => {
            this.applicants = resp;
            this.dataSource.data = this.applicants;
        });
        this.subscriptions.push(sub);

        if (!!this.paginator) {
            this.dataSource.paginator = this.paginator;
        }
        if (!!this.sort) {
            this.dataSource.sort = this.sort;
        }
    }

    grant(user: UserJson) {
        let sub = this.allianceApi.grantApplication(user.idUser).subscribe(resp => {
            if (resp) {
                this.reload();
            }
        });
        this.subscriptions.push(sub);
    }

    deny(user: UserJson) {
        let sub = this.allianceApi.denyApplication(user.idUser).subscribe(resp => {
            if (resp) {
                this.reload();
            }
        });
        this.subscriptions.push(sub);
    }
}
