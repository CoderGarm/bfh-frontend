import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {EnumValueDto, EventRanking, GameEventApiService, Player} from "../../../../services/swagger";
import EGameEventsEnum = EnumValueDto.EGameEventsEnum;

export interface EventPoints {
    rank: number;
    user: Player;
    total: number,
    v1: number,
    v3: number,
    v5: number
}

@Component({
    selector: 'app-tournament-24-points',
    templateUrl: './tournament-24-points.component.html',
    styleUrls: ['./tournament-24-points.component.scss']
})
export class Tournament24PointsComponent extends SubscriptionManager implements AfterViewInit {

    displayedColumns: string[] = ['rank', 'name', 'fights-won', 'wonV1', 'wonV3', 'wonV5'];
    dataSource: MatTableDataSource<EventPoints> = new MatTableDataSource<EventPoints>([]);

    @ViewChild(MatPaginator)
    paginator!: MatPaginator;

    @ViewChild(MatSort)
    sort!: MatSort;

    constructor(private gameEventApiService: GameEventApiService) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.gameEventApiService.getRankingForEvent(EGameEventsEnum.TOURNAMENT_FOR_HONOR_24)
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
                    total: 0,
                    v1: 0,
                    v3: 0,
                    v5: 0
                };
                rankedUserPoints.push(ranking);
            }

            ranking.v1 = point.rankingCategory == EventRanking.RankingCategoryEnum.WON_FIGHTS_V1 ? point.points : ranking.v1;
            ranking.v3 = point.rankingCategory == EventRanking.RankingCategoryEnum.WON_FIGHTS_V3 ? point.points : ranking.v3;
            ranking.v5 = point.rankingCategory == EventRanking.RankingCategoryEnum.WON_FIGHTS_V5 ? point.points : ranking.v5;
        });

        rankedUserPoints.forEach(p => this.calcOverall(p));
        rankedUserPoints.forEach(p => this.stateRank(p, rankedUserPoints));
        this.dataSource.data = rankedUserPoints.sort((a, b) => a.rank - b.rank);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }


    private calcOverall(element: EventPoints) {
        element.total += element.v1;
        element.total += element.v3;
        element.total += element.v5;
    }

    private stateRank(element: EventPoints, rankedUserPoints: EventPoints[]) {
        const betterThan = rankedUserPoints
            .filter(p => p.user.idUser != element.user.idUser)
            .filter(p => p.total! > element.total!).length;

        const equals = rankedUserPoints
            .filter(p => p.user.idUser != element.user.idUser)
            .filter(p => p.total == element.total).length;

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
