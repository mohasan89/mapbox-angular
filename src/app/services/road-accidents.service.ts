import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import {
  GeojsonPoinCollection,
  RoadAccidentProperties,
} from 'src/types/geojson';

@Injectable({
  providedIn: 'root',
})
export class RoadAccidentsService {
  constructor(private http: HttpClient) {}

  public fetchData() {
    return this.http.get<GeojsonPoinCollection<RoadAccidentProperties>>(
      'assets/data.geojson'
    );
  }
}
