import { ProfileComponent } from './../user/profile/profile.component';
import { AuthenticationService } from './../../services/authentication/authentication.service';
import {Component, HostListener, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {TokenStorage} from "../../services/authentication/token-storage.service";
import {Subscription} from "rxjs";


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  public isLoggedIn: boolean = false;

  private subscription?: Subscription;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private tokenStorage: TokenStorage) { }

  ngOnInit(): void {
    this.subscription = this.authenticationService.getAccessData().subscribe(loggedIn => {
      this.isLoggedIn = !!loggedIn;
      if (this.isLoggedIn && !this.tokenStorage.getInterruptedURL()) {
        this.router.navigateByUrl(ProfileComponent.path);
      }
    });
  }

  public logout() {
    this.isLoggedIn = false;
    this.authenticationService.logout();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event: any) {
    this.logout();
  }
  ngOnDestroy() {
    if (!!this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
