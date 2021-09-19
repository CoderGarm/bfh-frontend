import {Component, OnInit} from '@angular/core';
import {Route, Router, Routes} from '@angular/router';
import {AuthenticationService} from './services/authentication';
import {NavigationCreationService} from './services/navigation-creation.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title: string = 'bfh-fe';

  private subscription?: Subscription;

  routes: Routes = NavigationCreationService.createNavDrawerRoutes();

  isLoggedIn: boolean = false;

  activeRoute?: Route;

  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.subscription = this.authenticationService.getAccessData().subscribe(loggedIn => this.isLoggedIn = !!loggedIn);
  }

  navigate(route?: Route) {
    if (!route) {
      route = NavigationCreationService.getLoginRoute();
    }
    this.activeRoute = route;
    this.router.navigateByUrl("/" + route.path);
  }

  ngOnDestroy() {
    if (!!this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
