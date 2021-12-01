import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-expansion-tab-view',
  templateUrl: './expansion-tab-view.component.html',
  styleUrls: ['./expansion-tab-view.component.scss']
})
export class ExpansionTabViewComponent implements OnInit {

  static path: string = 'colonization';

  actionTabTitles: string[] = ['Organize expansion', 'See expansion'];

  constructor() {
  }

  ngOnInit(): void {
  }

}
