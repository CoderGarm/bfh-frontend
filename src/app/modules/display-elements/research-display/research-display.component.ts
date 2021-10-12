import {Component, Input, OnInit} from '@angular/core';
import {Research} from "../../../services/swagger";

@Component({
  selector: 'app-research-display',
  templateUrl: './research-display.component.html',
  styleUrls: ['./research-display.component.scss']
})
export class ResearchDisplayComponent implements OnInit {

  @Input()
  research?: Research;

  constructor() {
  }

  ngOnInit(): void {
  }

}
