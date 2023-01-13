import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {StarMapCommunicationService} from "../../../../star-map-communication.service";

@Component({
  selector: 'app-fleet-notch-transport',
  templateUrl: './fleet-notch-transport.component.html',
  styleUrls: ['./fleet-notch-transport.component.scss']
})
export class FleetNotchTransportComponent extends SubscriptionManager implements OnInit {

  commService: StarMapCommunicationService;

  constructor(commService: StarMapCommunicationService) {
    super();

    this.commService = commService;
  }

  ngOnInit(): void {
  }

}
