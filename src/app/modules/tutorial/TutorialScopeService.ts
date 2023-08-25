import {Injectable} from "@angular/core";
import {SubscriptionManager} from "../../subscription.manager";
import {NavigationCommunicationService} from "../../services/navigation/navigation-communication.service";
import {JournalTabViewComponent} from "../journal/components/orga/journal-tab-view/journal-tab-view.component";
import {PlanetTabViewComponent} from "../planets/components/orga/planet-tab-view/planet-tab-view.component";
import {FleetDashComponent} from "./topics/journalTabView/fleet-dash/fleet-dash.component";

export interface Topic {
    uuid: string,
    title: string,
    subTitle: string
}

@Injectable()
export class TutorialScopeService extends SubscriptionManager {

    active: string = '';
    hasTutorial: boolean = false;

    private static readonly TUTORIALS: string[] = [
        JournalTabViewComponent.name,
        PlanetTabViewComponent.name
    ];

    private static topicsByRoute: Map<string, Topic[]> = new Map<string, Topic[]>();
    static {
        this.topicsByRoute.set(JournalTabViewComponent.name, [new FleetDashComponent()]);
        /*
        this.topicsByRoute.set(JournalTabViewComponent.name, ['fleet', 'job', 'trade', 'infra', 'battle reports']);
        this.topicsByRoute.set(PlanetTabViewComponent.name, ['dash', 'constructions', 'shipyard', 'marketplace']);
        */
    }

    topics: Topic[] = [];

    constructor(protected navigationCommunicationService: NavigationCommunicationService) {
        super();

        this.setScope(JournalTabViewComponent.name);
        this.navigationCommunicationService.getNavigationEmitter().subscribe(route => this.setScope(route.component!.name));
    }

    private setScope(route: string) {
        console.log(route)
        this.active = route;
        this.hasTutorial = TutorialScopeService.TUTORIALS.includes(this.active);
        this.topics = TutorialScopeService.topicsByRoute.has(this.active) ? TutorialScopeService.topicsByRoute.get(this.active)! : [];
    }
}
