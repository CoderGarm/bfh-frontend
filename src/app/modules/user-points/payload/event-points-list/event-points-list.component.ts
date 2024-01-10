import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {EventRanking, GameEventApiService, Player} from "../../../../services/swagger";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

export interface EventPoints {
    rank: number;
    user: Player;
    gainedPlanets: number,
    gainedConstructionLevels: number,
    fleetTonnageLost: number,
    fleetTonnageDestroyed: number,
    overallPoints: number
}

@Component({
    selector: 'app-event-points-list',
    templateUrl: './event-points-list.component.html',
    styleUrls: ['./event-points-list.component.scss']
})
export class EventPointsListComponent extends SubscriptionManager implements AfterViewInit {

    displayedColumns: string[] = ['rank', 'name', 'gainedPlanets', 'gainedConstructionLevels', 'fleetTonnageLost', 'fleetTonnageDestroyed'];
    dataSource: MatTableDataSource<EventPoints> = new MatTableDataSource<EventPoints>([]);

    @ViewChild(MatPaginator)
    paginator!: MatPaginator;

    @ViewChild(MatSort)
    sort!: MatSort;

    constructor(private gameEventApiService: GameEventApiService) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.gameEventApiService.getEventRanking()
            .subscribe(resp => this.setDatasource(resp));
        this.subscriptions.push(sub);
    }

    private setDatasource(points: EventRanking[]) {

        let rankedUserPoints: EventPoints[] = [];

        points.forEach(point => {
            let ranking = rankedUserPoints.find(r => r.user.idUser === point.user.idUser);
            if (!ranking) {
                ranking = {
                    user: point.user,
                    rank: 0,
                    overallPoints: 0,
                    fleetTonnageDestroyed: 0,
                    fleetTonnageLost: 0,
                    gainedConstructionLevels: 0,
                    gainedPlanets: 0
                };
                rankedUserPoints.push(ranking);
            }

            ranking.fleetTonnageDestroyed = point.rankingCategory == EventRanking.RankingCategoryEnum.FLEET_TONNAGE_DESTROYED ? point.points : ranking.fleetTonnageDestroyed;
            ranking.fleetTonnageLost = point.rankingCategory == EventRanking.RankingCategoryEnum.FLEET_TONNAGE_LOST ? point.points : ranking.fleetTonnageLost;
            ranking.gainedConstructionLevels = point.rankingCategory == EventRanking.RankingCategoryEnum.GAINED_CONSTRUCTION_LEVELS ? point.points : ranking.gainedConstructionLevels;
            ranking.gainedPlanets = point.rankingCategory == EventRanking.RankingCategoryEnum.GAINED_PLANETS ? point.points : ranking.gainedPlanets;
        });

        rankedUserPoints.forEach(p => this.calcOverall(p));
        rankedUserPoints.forEach(p => this.stateRank(p, rankedUserPoints));
        this.dataSource.data = rankedUserPoints.sort((a, b) => a.rank - b.rank);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }


    private calcOverall(element: EventPoints) {
        element.overallPoints += element.gainedPlanets * 10000;
        element.overallPoints += element.gainedConstructionLevels * 100;
        element.overallPoints += (element.fleetTonnageLost + element.fleetTonnageDestroyed) / 100000;
    }

    private stateRank(element: EventPoints, rankedUserPoints: EventPoints[]) {
        const betterThan = rankedUserPoints
            .filter(p => p.user.idUser != element.user.idUser)
            .filter(p => p.overallPoints! > element.overallPoints!).length;

        const equals = rankedUserPoints
            .filter(p => p.user.idUser != element.user.idUser)
            .filter(p => p.overallPoints == element.overallPoints).length;

        element.rank = (equals + betterThan) + 1;
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
