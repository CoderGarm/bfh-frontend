import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {Player, UserApiService, UserPoints} from "../../../../services/swagger";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";

export interface RankedUserPoints {
    rank: number;
    user: Player;
    points: UserPoints;
}

@Component({
    selector: 'app-player-points-list',
    templateUrl: './player-points-list.component.html',
    styleUrls: ['./player-points-list.component.scss']
})
export class PlayerPointsListComponent extends SubscriptionManager implements AfterViewInit {

    private users: Player[] = [];
    private points: UserPoints[] = [];
    private rankedUserPoints: RankedUserPoints[] = [];

    displayedColumns: string[] = ['rank', 'name', 'ally-tag', 'overallPoints', 'planetaryPoints', 'fleetPoints', 'researchPoints'];
    dataSource: MatTableDataSource<RankedUserPoints> = new MatTableDataSource<RankedUserPoints>(this.rankedUserPoints);


    @ViewChild(MatPaginator)
    paginator!: MatPaginator;

    @ViewChild(MatSort)
    sort!: MatSort;

    constructor(private userService: UserApiService) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.userService.getAllUsers().subscribe(resp => this.addData(resp));
        this.subscriptions.push(sub);
    }

    private addData(users: Player[]) {
        this.users = users;
        this.users.forEach(user => {
            const sub = this.userService.getUsersPoints(user.idUser).subscribe(resp => {
                this.points.push(resp);
                this.setDatasource();
            });
            this.subscriptions.push(sub);
        })
    }

    private setDatasource() {
        this.rankedUserPoints = this.points.map(p => {
            return {
                user: p.user,
                rank: this.getRank(p),
                points: p
            };
        })
        this.dataSource.data = this.rankedUserPoints.sort((a, b) => a.rank - b.rank);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    private getRank(element: UserPoints) {
        const betterThan = this.points
            .filter(p => p.user.idUser != element.user.idUser)
            .filter(p => p.overallPoints > element.overallPoints).length;

        const equals = this.points
            .filter(p => p.user.idUser != element.user.idUser)
            .filter(p => p.overallPoints == element.overallPoints)
            .filter(p => p.createdAt < element.createdAt).length;

        return (equals + betterThan) + 1;
    }


    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
        this.dataSource.filterPredicate = function (data, filter: string): boolean {
            return data.user.username.toLowerCase().includes(filter.toLowerCase());
        };

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
}
