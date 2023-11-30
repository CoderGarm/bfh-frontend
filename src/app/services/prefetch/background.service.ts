import {Injectable, NgZone} from '@angular/core';
import {SubscriptionManager} from "../../subscription.manager";
import {
    ColonizationApiService,
    PublicResourcesApiService,
    ResearchApiService,
    ResearchLevel,
    ResearchTree,
    StarMapApiService,
    StarSystem,
    StarSystemColonization
} from "../swagger";
import {interval, ReplaySubject} from "rxjs";
import {ModuleService} from "./module.service";
import {AssetsService, Junction} from "../assets/assets.service";
import {AuthenticationService} from "../authentication";

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

    private researchTree?: ResearchTree;
    private o4: ReplaySubject<ResearchTree> = new ReplaySubject();

    private completedResearches: ResearchLevel[] = [];
    private o5: ReplaySubject<ResearchLevel[]> = new ReplaySubject();

    constructor(private zone: NgZone,
                private colonizationService: ColonizationApiService,
                private publicResourceService: PublicResourcesApiService,
                private mapService: StarMapApiService,
                private researchService: ResearchApiService,
                private moduleService: ModuleService,
                private authService: AuthenticationService,
                private assetService: AssetsService) {
        super();

        this.authService.isAuthorized().subscribe(isAuthorized => this.fetchData());

        this.zone.run(() => {
            let sub = this.publicResourceService.getOpenTechTree().subscribe(resp => this.researchTree = resp);
            this.subscriptions.push(sub);
        });
    }

    private fetchData() {
        if (!!this.userId)
            this.zone.run(() => {
                let sub = this.colonizationService.getColonizationStarSystemsForUser().subscribe(resp => this.colonizations = resp);
                this.subscriptions.push(sub);
                sub = this.assetService.getAllWormholeJunctions().subscribe(resp => this.junctions = resp)
                this.subscriptions.push(sub);
                sub = this.mapService.getStarSystems().subscribe(resp => this.starSystems = resp);
                this.subscriptions.push(sub);

                if (!this.researchTree) {
                    sub = this.researchService.getTree().subscribe(resp => this.researchTree = resp);
                    this.subscriptions.push(sub);
                }

                sub = this.researchService.getResearchByUser().subscribe(resp => this.completedResearches = resp);
                this.subscriptions.push(sub);
            });
    }

    public getResearchTree() {
        if (!this.researchTree) {
            const source = interval(100);
            let sub = source.subscribe(val => {
                // and later again repetitive
                if (!!this.researchTree) {
                    this.fireResearchTree();
                    sub.unsubscribe();
                }
            });
            this.subscriptions.push(sub);
        } else {
            setTimeout(() => {
                this.fireResearchTree();
            }, 10);
        }
        return this.o4;
    }

    private fireResearchTree() {
        this.zone.run(() => {
            this.o4.next(this.researchTree!);
        });
    }

    public getCompletedResearches() {
        if (this.completedResearches.length == 0) {
            const source = interval(100);
            let sub = source.subscribe(val => {
                // and later again repetitive
                if (this.completedResearches.length > 0) {
                    this.fireCompletedResearches();
                    sub.unsubscribe();
                }
            });
            this.subscriptions.push(sub);
        } else {
            setTimeout(() => {
                this.fireCompletedResearches();
            }, 10);
        }
        return this.o5;
    }

    private fireCompletedResearches() {
        this.zone.run(() => {
            this.o5.next(this.completedResearches);
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
    public getColonizationStarSystemsForUser() {
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
    public getStarSystems() {
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
