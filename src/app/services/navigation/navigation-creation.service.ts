import {ChatComponent} from '../../modules/chat/components/chat/chat.component';
import {HomeComponent} from '../../components/home/home.component';
import {ProfileComponent} from '../../components/user/profile/profile.component';
import {LoginComponent} from '../../components/user/login/login.component';
import {RegisterComponent} from '../../components/user/register/register.component';
import {Route, Routes} from '@angular/router';
import {ProtectedGuard} from 'ngx-auth';
import {StarMapTabViewComponent} from "../../modules/star-map/orga/star-map-tab-view/star-map-tab-view.component";
import {ResearchTabViewComponent} from "../../modules/research/components/orga/research-tab-view/research-tab-view.component";
import {ExpansionTabViewComponent} from "../../modules/expansion/components/orga/expansion-tab-view/expansion-tab-view.component";
import {JournalTabViewComponent} from "../../modules/journal/components/orga/journal-tab-view/journal-tab-view.component";
import {AdminTabViewComponent} from "../../modules/admin/components/orga/admin-tab-view/admin-tab-view.component";
import {ForumsListComponent} from "../../modules/forum/components/forums-list/forums-list.component";
import {AllianceTabViewComponent} from "../../modules/alliance/components/orga/alliance-tab-view/alliance-tab-view.component";
import {WikiMainComponent} from "../../modules/wiki/orga/wiki-main/wiki-main.component";
import {TransportTabViewComponent} from "../../modules/transportation/orga/transport-tab-view/transport-tab-view.component";
import {ShipClassSelectionComponent} from "../../modules/ship-class-construction/components/orga/ship-class-selection/ship-class-selection.component";
import {PlanetSelectionComponent} from "../../modules/planets/components/orga/planet-selection/planet-selection.component";
import {FleetSelectionComponent} from "../../modules/fleet/components/orga/fleet-selection/fleet-selection.component";
import {ShipClassTabViewComponent} from "../../modules/ship-class-construction/components/orga/ship-class-tab-view/ship-class-tab-view.component";
import {PlanetTabViewComponent} from "../../modules/planets/components/orga/planet-tab-view/planet-tab-view.component";
import {FleetTabViewComponent} from "../../modules/fleet/components/orga/fleet-tab-view/fleet-tab-view.component";
import {FittingCreateComponent} from "../../modules/ship-class-construction/components/payload/fitting-create/fitting-create.component";


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
            {path: ProfileComponent.path, component: ProfileComponent, canActivate: [ProtectedGuard]},
        ];
    }

    static createAdminRoutes(): Routes {
        return [
            {path: AdminTabViewComponent.path, component: AdminTabViewComponent, canActivate: [ProtectedGuard]},
        ];
    }

    static createSidenavRoutes(): Routes {
        return [
            {path: AllianceTabViewComponent.path, component: AllianceTabViewComponent, canActivate: [ProtectedGuard]},
            {path: ChatComponent.path, component: ChatComponent, canActivate: [ProtectedGuard]},
            {path: ForumsListComponent.path, component: ForumsListComponent, canActivate: [ProtectedGuard]},
            {path: JournalTabViewComponent.path, component: JournalTabViewComponent, canActivate: [ProtectedGuard]},
            NavigationCreationService.getPlanetRoute(),
            {path: StarMapTabViewComponent.path, component: StarMapTabViewComponent, canActivate: [ProtectedGuard]},
            {path: ResearchTabViewComponent.path, component: ResearchTabViewComponent, canActivate: [ProtectedGuard]},
            NavigationCreationService.getShipYardRoute(),
            NavigationCreationService.getFleetRoute(),
            {path: ExpansionTabViewComponent.path, component: ExpansionTabViewComponent, canActivate: [ProtectedGuard]},
            {path: TransportTabViewComponent.path, component: TransportTabViewComponent, canActivate: [ProtectedGuard]},
        ];
    }

    static getFleetRoute() {
        return {path: FleetTabViewComponent.path, component: FleetTabViewComponent, canActivate: [ProtectedGuard], data: {'sidenav': FleetSelectionComponent}};
    }

    static getPlanetRoute() {
        return {path: PlanetTabViewComponent.path, component: PlanetTabViewComponent, canActivate: [ProtectedGuard], data: {'sidenav': PlanetSelectionComponent}};
    }

    static getShipYardRoute() {
        return {path: ShipClassTabViewComponent.path, component: ShipClassTabViewComponent, canActivate: [ProtectedGuard], data: {'sidenav': ShipClassSelectionComponent}};
    }

    static getShipYardCreateRoute() {
        return {path: FittingCreateComponent.path, component: FittingCreateComponent, canActivate: [ProtectedGuard]};
    }

    static createBurgerMenuRoutes(): Routes {
        return [
            {path: WikiMainComponent.path, component: WikiMainComponent},
        ];
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
