import {Injectable, NgZone} from '@angular/core';
import {SubscriptionManager} from "../../subscription.manager";
import {ColonizationApiService, StarMapApiService, StarSystem, StarSystemColonization} from "../swagger";
import {interval, ReplaySubject} from "rxjs";
import {ModuleService} from "./module.service";
import {AssetsService, Junction} from "../assets/assets.service";

/**
 * Executed slow queries in the background and sends the data if the original request is finished.
 */
@Injectable()
export class BackgroundService extends SubscriptionManager {

    private starSystems: StarSystem[] = [];
    private o1: ReplaySubject<StarSystem[]> = new ReplaySubject();

    private colonizations: StarSystemColonization[] = [];
    private o2: ReplaySubject<StarSystemColonization[]> = new ReplaySubject();

    private junctions: Junction[] = [];
    private o3: ReplaySubject<Junction[]> = new ReplaySubject();

    constructor(private zone: NgZone,
                private colonizationService: ColonizationApiService,
                private mapService: StarMapApiService,
                private moduleService: ModuleService,
                private assetService: AssetsService) {
        super();

        this.zone.run(() => {
            let sub = this.colonizationService.getColonizationStarSystemsForUser().subscribe(resp => this.colonizations = resp);
            this.subscriptions.push(sub);
            sub = this.assetService.getAllWormholeJunctions().subscribe(resp => this.junctions = resp)
            this.subscriptions.push(sub);
        });

        this.zone.run(() => {
            let systems: StarSystem[] | undefined = this.tokenStorage.getSystems()
            if (!systems) {
                let sub = this.mapService.getStarSystems()
                    .subscribe(resp => {
                        this.starSystems = resp;
                        this.tokenStorage.rememberSystems(resp);
                    });
                this.subscriptions.push(sub);
            } else {
                this.starSystems = systems;
            }
        });
    }

    private fireStarSystems() {
        this.zone.run(() => {
            this.o1.next(this.starSystems);
        });
    }

    private fireColonizations() {
        this.zone.run(() => {
            this.o2.next(this.colonizations);
        });
    }

    /**
     * Strange idea:<br>
     * The subscriber has just to wait until the data is fetched. If the data is present it will be fired async 10 ms after subscribing.
     */
    public getColonizationStarSystemsForUser(): ReplaySubject<StarSystemColonization[]> {
        if (this.colonizations.length == 0) {
            const source = interval(100);
            let sub = source.subscribe(val => {
                // and later again repetitive
                if (this.colonizations.length != 0) {
                    this.fireColonizations();
                    sub.unsubscribe();
                }
            });
            this.subscriptions.push(sub);
        } else {
            setTimeout(() => {
                this.fireColonizations();
            }, 10);
        }
        return this.o2;
    }

    /**
     * Strange idea:<br>
     * The subscriber has just to wait until the data is fetched. If the data is present it will be fired async 10 ms after subscribing.
     */
    public getStarSystems(): ReplaySubject<StarSystem[]> {
        if (this.starSystems.length == 0) {
            const source = interval(100);
            let sub = source.subscribe(val => {
                // and later again repetitive
                if (this.starSystems.length != 0) {
                    this.fireStarSystems();
                    sub.unsubscribe();
                }
            });
            this.subscriptions.push(sub);
        } else {
            setTimeout(() => {
                this.fireStarSystems();
            }, 10);
        }
        return this.o1;
    }

    public getStarSystemsAsArray(): StarSystem[] {
        return this.starSystems;
    }

    /**
     * Strange idea:<br>
     * The subscriber has just to wait until the data is fetched. If the data is present it will be fired async 10 ms after subscribing.
     */
    public getAllWormholeJunctions(): ReplaySubject<Junction[]> {
        if (this.junctions.length == 0) {
            const source = interval(100);
            let sub = source.subscribe(val => {
                // and later again repetitive
                if (this.junctions.length != 0) {
                    this.fireJunctions();
                    sub.unsubscribe();
                }
            });
            this.subscriptions.push(sub);
        } else {
            setTimeout(() => {
                this.fireJunctions();
            }, 10);
        }
        return this.o3;
    }

    private fireJunctions() {
        this.zone.run(() => {
            this.o3.next(this.junctions);
        });
    }
}
