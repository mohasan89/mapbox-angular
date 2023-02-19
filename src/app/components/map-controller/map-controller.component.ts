import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { RoadAccidentProperties } from 'src/types/geojson';

@Component({
  selector: 'app-map-controller',
  templateUrl: './map-controller.component.html',
  styleUrls: ['./map-controller.component.scss'],
})
export class MapControllerComponent implements OnInit {
  @Input() accedintType: string[] = [];
  @Input() activeOption: null | RoadAccidentProperties = null;

  @Output() selectionChanged: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
  changeHandler(type: string) {
    this.selectionChanged.emit(type);
  }
}
