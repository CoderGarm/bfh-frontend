import {ChatComponent} from '../../modules/chat/components/chat/chat.component';
import {HomeComponent} from '../../components/home/home.component';
import {LoginComponent} from '../../components/user/login/login.component';
import {RegisterComponent} from '../../components/user/register/register.component';
import {Route, Routes} from '@angular/router';
import {StarMapTabViewComponent} from "../../modules/star-map/orga/star-map-tab-view/star-map-tab-view.component";
import {ResearchTabViewComponent} from "../../modules/research/components/orga/research-tab-view/research-tab-view.component";
import {ExpansionTabViewComponent} from "../../modules/expansion/components/orga/expansion-tab-view/expansion-tab-view.component";
import {JournalTabViewComponent} from "../../modules/journal/components/orga/journal-tab-view/journal-tab-view.component";
import {AdminTabViewComponent} from "../../modules/admin/components/orga/admin-tab-view/admin-tab-view.component";
import {ForumsListComponent} from "../../modules/forum/components/forums-list/forums-list.component";
import {AllianceTabViewComponent} from "../../modules/alliance/components/orga/alliance-tab-view/alliance-tab-view.component";
import {WikiMainComponent} from "../../modules/wiki/orga/wiki-main/wiki-main.component";
import {TransportMainViewComponent} from "../../modules/transportation/orga/transport-tab-view/transport-main-view.component";
import {ShipClassSelectionComponent} from "../../modules/ship-class-construction/components/orga/ship-class-selection/ship-class-selection.component";
import {PlanetSelectionComponent} from "../../modules/planets/components/orga/planet-selection/planet-selection.component";
import {FleetSelectionComponent} from "../../modules/fleet/components/orga/fleet-selection/fleet-selection.component";
import {ShipClassTabViewComponent} from "../../modules/ship-class-construction/components/orga/ship-class-tab-view/ship-class-tab-view.component";
import {PlanetTabViewComponent} from "../../modules/planets/components/orga/planet-tab-view/planet-tab-view.component";
import {FleetTabViewComponent} from "../../modules/fleet/components/orga/fleet-tab-view/fleet-tab-view.component";
import {FittingCreateComponent} from "../../modules/ship-class-construction/components/payload/fitting-create/fitting-create.component";
import {ForgottenPasswordComponent} from "../../components/user/forgotten-password/forgotten-password.component";
import {PlayerPointsListComponent} from "../../modules/user-points/player-points-list/player-points-list.component";
import {StratOpsTabViewComponent} from "../../modules/strategic-operations/orga/strat-ops-tab-view/strat-ops-tab-view.component";
import {TakeATourComponent} from "../../components/take-a-tour/take-a-tour.component";
import {protectedGuard} from "ngx-auth";
import {ProfileTabViewComponent} from "../../components/user/profile-tab-view/profile-tab-view.component";


export class NavigationCreationService {

    public static AFTER_LOGIN_ROUTE: string = JournalTabViewComponent.path;

    static getLoginRoute(): Route {
        return {path: LoginComponent.path, component: LoginComponent};
    }

    static createBasicRoutes(): Routes {
        return [
            {path: HomeComponent.path, component: HomeComponent},
            {path: RegisterComponent.path, component: RegisterComponent},
            {path: LoginComponent.path, component: LoginComponent},
            {path: ForgottenPasswordComponent.path, component: ForgottenPasswordComponent},
            {path: ForgottenPasswordComponent.paramPath, component: ForgottenPasswordComponent},
            {path: ProfileTabViewComponent.path, component: ProfileTabViewComponent, canActivate: [protectedGuard]},
        ];
    }

    static createAdminRoutes(): Routes {
        return [
            {path: AdminTabViewComponent.path, component: AdminTabViewComponent, canActivate: [protectedGuard]},
        ];
    }

    static createSidenavRoutes(): Routes {
        return [
            {path: PlayerPointsListComponent.path, component: PlayerPointsListComponent, canActivate: [protectedGuard]},
            {path: AllianceTabViewComponent.path, component: AllianceTabViewComponent, canActivate: [protectedGuard]},
            {path: ChatComponent.path, component: ChatComponent, canActivate: [protectedGuard]},
            {path: ForumsListComponent.path, component: ForumsListComponent, canActivate: [protectedGuard]},
            {path: JournalTabViewComponent.path, component: JournalTabViewComponent, canActivate: [protectedGuard]},
            NavigationCreationService.getPlanetRoute(),
            {path: StarMapTabViewComponent.path, component: StarMapTabViewComponent, canActivate: [protectedGuard]},
            {path: ResearchTabViewComponent.path, component: ResearchTabViewComponent, canActivate: [protectedGuard]},
            NavigationCreationService.getShipYardRoute(),
            NavigationCreationService.getFleetRoute(),
            {path: StratOpsTabViewComponent.path, component: StratOpsTabViewComponent, canActivate: [protectedGuard]},
            {path: ExpansionTabViewComponent.path, component: ExpansionTabViewComponent, canActivate: [protectedGuard]},
            {path: TransportMainViewComponent.path, component: TransportMainViewComponent, canActivate: [protectedGuard]},
        ];
    }

    static getFleetRoute() {
        return {path: FleetTabViewComponent.path, component: FleetTabViewComponent, canActivate: [protectedGuard], data: {'sidenav': FleetSelectionComponent}};
    }

    static getPlanetRoute() {
        return {path: PlanetTabViewComponent.path, component: PlanetTabViewComponent, canActivate: [protectedGuard], data: {'sidenav': PlanetSelectionComponent}};
    }

    static getShipYardRoute() {
        return {path: ShipClassTabViewComponent.path, component: ShipClassTabViewComponent, canActivate: [protectedGuard], data: {'sidenav': ShipClassSelectionComponent}};
    }

    static getShipYardCreateRoute() {
        return {path: FittingCreateComponent.path, component: FittingCreateComponent, canActivate: [protectedGuard]};
    }

    static createBurgerMenuRoutes(): Routes {
        return [
            {path: WikiMainComponent.path, component: WikiMainComponent},
            this.getTakeATourRoute(),
        ];
    }

    static getTakeATourRoute(): Route {
        return {path: TakeATourComponent.path, component: TakeATourComponent};
    }

    static createAllRoutes(): Routes {
        const routes: Route[] = [];
        routes.push(NavigationCreationService.getLoginRoute());
        routes.push(NavigationCreationService.getShipYardCreateRoute());
        routes.push(...NavigationCreationService.createBasicRoutes());
        routes.push(...NavigationCreationService.createAdminRoutes());
        routes.push(...NavigationCreationService.createSidenavRoutes());
        routes.push(...NavigationCreationService.createBurgerMenuRoutes());
        return routes;
    }
}
