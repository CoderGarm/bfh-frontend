import {Component, OnInit} from '@angular/core';
import {PlanetAbstractId, PlanetApiService} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../subscription.manager";

@Component({
    selector: 'app-transport-main-view',
    templateUrl: './transport-main-view.component.html',
    styleUrls: ['./transport-main-view.component.scss']
})
export class TransportMainViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'transportation';

    public static readonly ALLOW_CIVIL_MIGRATION: boolean = true;

    planets: PlanetAbstractId[] = [];

    constructor(private planetService: PlanetApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.planetService.getPlanetByUsersForNaming().subscribe(resp => this.planets = resp);
        this.subscriptions.push(sub);
    }
}
