import {Component} from '@angular/core';
import {PropertyHolder} from "../property-holder";
import {EnumValueDto} from "../../../../../services/swagger";
import ETimeMetricsEnum = EnumValueDto.ETimeMetricsEnum;

@Component({
  selector: 'app-properties-launcher',
  templateUrl: './properties-launcher.component.html',
  styleUrls: ['./properties-launcher.component.scss']
})
export class PropertiesLauncherComponent extends PropertyHolder {

  protected readonly EnumValueDto = EnumValueDto;
  protected readonly ETimeMetricsEnum = ETimeMetricsEnum;
}
