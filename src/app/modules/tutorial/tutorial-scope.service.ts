import {Injectable} from "@angular/core";
import {SubscriptionManager} from "../../subscription.manager";
import {NavigationCommunicationService} from "../../services/navigation/navigation-communication.service";
import {JournalTabViewComponent} from "../journal/components/orga/journal-tab-view/journal-tab-view.component";
import {PlanetTabViewComponent} from "../planets/components/orga/planet-tab-view/planet-tab-view.component";
import {TutorialFleetDashComponent} from "./topics/journalTabView/fleet-dash/tutorial-fleet-dash.component";
import {TutorialJobDashComponent} from "./topics/journalTabView/job-dash/tutorial-job-dash.component";
import {TutorialTradeDashComponent} from "./topics/journalTabView/trade-dash/tutorial-trade-dash.component";
import {TutorialInfraDashComponent} from "./topics/journalTabView/infra-dash/tutorial-infra-dash.component";
import {TutorialBattleDashComponent} from "./topics/journalTabView/battle-dash/tutorial-battle-dash.component";
import {TutorialPlanetDashComponent} from "./topics/planetTabView/dash/tutorial-planet-dash.component";
import {TutorialPlanetConstructionsComponent} from "./topics/planetTabView/constructions/tutorial-planet-constructions.component";
import {TutorialMarketplaceComponent} from "./topics/planetTabView/market/tutorial-marketplace.component";
import {TutorialPlanetShipyardComponent} from "./topics/planetTabView/shipyard/tutorial-planet-shipyard.component";
import {TransportTabViewComponent} from "../transportation/orga/transport-tab-view/transport-tab-view.component";
import {TutorialInnerEmpireTransportationComponent} from "./topics/tutorial-inner-empire-transportation/tutorial-inner-empire-transportation.component";
import {StarMapTabViewComponent} from "../star-map/orga/star-map-tab-view/star-map-tab-view.component";
import {TutorialUniverseMapComponent} from "./topics/starMapTabView/tutorial-universe-map/tutorial-universe-map.component";
import {TutorialStarMapComponent} from "./topics/starMapTabView/tutorial-star-map/tutorial-star-map.component";

export interface Topic {
    uuid: string,
    title: string,
    subTitle: string
}

@Injectable()
export class TutorialScopeService extends SubscriptionManager {

    active: string = '';
    hasTutorial: boolean = false;
    openTopic?: Topic;

    private static readonly TUTORIALS: string[] = [
        JournalTabViewComponent.path,
        PlanetTabViewComponent.path,
        TransportTabViewComponent.path,
        StarMapTabViewComponent.path,
    ];

    private static topicsByRoute: Map<string, Topic[]> = new Map<string, Topic[]>();
    static {
        this.topicsByRoute.set(JournalTabViewComponent.path, [
            TutorialFleetDashComponent.TOPIC,
            TutorialJobDashComponent.TOPIC,
            TutorialTradeDashComponent.TOPIC,
            TutorialInfraDashComponent.TOPIC,
            TutorialBattleDashComponent.TOPIC
        ]);
        this.topicsByRoute.set(PlanetTabViewComponent.path, [
            TutorialPlanetDashComponent.TOPIC,
            TutorialPlanetConstructionsComponent.TOPIC,
            TutorialPlanetShipyardComponent.TOPIC,
            TutorialMarketplaceComponent.TOPIC
        ]);
        this.topicsByRoute.set(TransportTabViewComponent.path, [
            TutorialInnerEmpireTransportationComponent.TOPIC,
        ]);
        this.topicsByRoute.set(StarMapTabViewComponent.path, [
            TutorialUniverseMapComponent.TOPIC,
            TutorialStarMapComponent.TOPIC,
        ]);
    }

    topics: Topic[] = [];

    constructor(protected navigationCommunicationService: NavigationCommunicationService) {
        super();

        this.setScope(JournalTabViewComponent.path);
        this.navigationCommunicationService.getNavigationEmitter().subscribe(route => this.setScope(route.path!));
    }

    private setScope(route: string) {
        if (this.tokenStorage.isLocalhost()) {
            console.log(route);
        }
        this.active = route;
        this.hasTutorial = TutorialScopeService.TUTORIALS.includes(this.active);
        this.topics = TutorialScopeService.topicsByRoute.has(this.active) ? TutorialScopeService.topicsByRoute.get(this.active)! : [];
    }

    setOpenTopic(topic?: Topic) {
        console.log(topic)
        this.openTopic = topic;
    }
}
