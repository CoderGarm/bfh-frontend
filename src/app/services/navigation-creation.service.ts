import {PlanetsSidenavComponent} from '../modules/planets/components/orga/planets-sidenav/planets-sidenav.component';
import {ChatComponent} from '../modules/chat/components/chat/chat.component';
import {HomeComponent} from './../components/home/home.component';
import {ProfileComponent} from './../components/user/profile/profile.component';
import {LoginComponent} from './../components/user/login/login.component';
import {RegisterComponent} from '../components/user/register/register.component';
import {Route, Routes} from '@angular/router';
import {ProtectedGuard} from 'ngx-auth';
import {StarMapTabViewComponent} from "../modules/star-map/orga/star-map-tab-view/star-map-tab-view.component";
import {ResearchTabViewComponent} from "../modules/research/components/orga/research-tab-view/research-tab-view.component";
import {ShipClassSidenavComponent} from "../modules/ship-class-construction/components/orga/ship-class-sidenav/ship-class-sidenav.component";
import {FleetSidenavComponent} from "../modules/fleet/components/orga/fleet-sidenav/fleet-sidenav.component";
import {ExpansionTabViewComponent} from "../modules/expansion/components/orga/expansion-tab-view/expansion-tab-view.component";
import {JournalTabViewComponent} from "../modules/journal/components/orga/journal-tab-view/journal-tab-view.component";
import {AdminPageComponent} from "../modules/admin/components/admin-page/admin-page.component";
import {ForumsListComponent} from "../modules/forum/components/forums-list/forums-list.component";


export class NavigationCreationService {

    static getLoginRoute(): Route {
        return {path: LoginComponent.path, component: LoginComponent};
    }

    static createRoutes(): Routes {
        return [
            {path: HomeComponent.path, component: HomeComponent},
            {path: RegisterComponent.path, component: RegisterComponent},
            {path: LoginComponent.path, component: LoginComponent},
            {path: ProfileComponent.path, component: ProfileComponent, canActivate: [ProtectedGuard]},
            {path: ChatComponent.path, component: ChatComponent, canActivate: [ProtectedGuard]},
            {path: PlanetsSidenavComponent.path, component: PlanetsSidenavComponent, canActivate: [ProtectedGuard]},
            {path: StarMapTabViewComponent.path, component: StarMapTabViewComponent, canActivate: [ProtectedGuard]},
            {path: ResearchTabViewComponent.path, component: ResearchTabViewComponent, canActivate: [ProtectedGuard]},
            {path: ShipClassSidenavComponent.path, component: ShipClassSidenavComponent, canActivate: [ProtectedGuard]},
            {path: FleetSidenavComponent.path, component: FleetSidenavComponent, canActivate: [ProtectedGuard]},
            {path: ExpansionTabViewComponent.path, component: ExpansionTabViewComponent, canActivate: [ProtectedGuard]},
            {path: JournalTabViewComponent.path, component: JournalTabViewComponent, canActivate: [ProtectedGuard]},
            {path: ForumsListComponent.path, component: ForumsListComponent, canActivate: [ProtectedGuard]},
            {path: AdminPageComponent.path, component: AdminPageComponent, canActivate: [ProtectedGuard]}, // todo role based access
        ];
    }

    static createNavDrawerRoutes(): Routes {
        return [
            {path: ChatComponent.path, component: ChatComponent, canActivate: [ProtectedGuard]},
            {path: ForumsListComponent.path, component: ForumsListComponent, canActivate: [ProtectedGuard]},
            {path: JournalTabViewComponent.path, component: JournalTabViewComponent, canActivate: [ProtectedGuard]},
            {path: PlanetsSidenavComponent.path, component: PlanetsSidenavComponent, canActivate: [ProtectedGuard]},
            {path: StarMapTabViewComponent.path, component: StarMapTabViewComponent, canActivate: [ProtectedGuard]},
            {path: ResearchTabViewComponent.path, component: ResearchTabViewComponent, canActivate: [ProtectedGuard]},
            {path: ShipClassSidenavComponent.path, component: ShipClassSidenavComponent, canActivate: [ProtectedGuard]},
            {path: FleetSidenavComponent.path, component: FleetSidenavComponent, canActivate: [ProtectedGuard]},
            {path: ExpansionTabViewComponent.path, component: ExpansionTabViewComponent, canActivate: [ProtectedGuard]},
        ];
    }
}
