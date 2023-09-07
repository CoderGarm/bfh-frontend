import {Component} from '@angular/core';
import {SubscriptionManager} from "../../subscription.manager";
import {SpinnerService} from "../../services/spinner.service";

@Component({
  selector: 'app-screen-size-warning',
  templateUrl: './screen-size-warning.component.html',
  styleUrls: ['./screen-size-warning.component.scss']
})
export class ScreenSizeWarningComponent extends SubscriptionManager {

  rememberIgnoreScreenWarning: boolean;


  constructor(private spinner: SpinnerService) {
    super();

    this.rememberIgnoreScreenWarning = this.tokenStorage.getRememberScreenWarning();
  }

  closeScreenSizeWarning() {
    this.spinner.hide('screen-size');
    this.tokenStorage.rememberScreenWarning(this.rememberIgnoreScreenWarning);
  }
}
