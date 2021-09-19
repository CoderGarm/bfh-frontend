import {Component, Input, OnInit} from '@angular/core';
import {Armor} from "../../../services/swagger";

@Component({
  selector: 'app-armor-module-display',
  templateUrl: './armor-module-display.component.html',
  styleUrls: ['./armor-module-display.component.scss']
})
export class ArmorModuleDisplayComponent implements OnInit {

  /**
   * the module which should be displayed
   */
  @Input()
  moduleInput!: Armor;

  constructor() {
  }

  ngOnInit(): void {
  }

}
