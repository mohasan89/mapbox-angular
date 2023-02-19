import { Component, OnInit } from '@angular/core';
import { RoadAccidentsService } from 'src/app/services/road-accidents.service';

import * as mapboxgl from 'mapbox-gl';

import { environment } from 'src/environments/environment';

import {
  FeaturePoint,
  GeojsonPoinCollection,
  RoadAccidentProperties,
} from 'src/types/geojson';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  loading = false;
  error = '';
  data!: GeojsonPoinCollection<RoadAccidentProperties>;

  style = 'mapbox://styles/mapbox/streets-v11';
  map!: mapboxgl.Map;

  activeOpt: null | RoadAccidentProperties = null;
  colorsList = [
    '#334155',
    '#2dd4bf',
    '#2dd4bf',
    '#38bdf8',
    '#fbbf24',
    '#374151',
    '#fb923c',
    '#0e7490',
    '#44403c',
    '#b91c1c',
    '#c2410c',
    '#b45309',
    '#a16207',
    '#4d7c0f',
    '#15803d',
    '#3f3f46',
    '#0f766e',
    '#0369a1',
    '#34d399',
    '#1d4ed8',
    '#c7d2fe',
    '#4338ca',
    '#7e22ce',
    '#a21caf',
    '#be185d',
    '#be123c',
    '#f87171',
    '#facc15',
    '#facc15',
    '#a3e635',
    '#4ade80',

    '#60a5fa',
    '#818cf8',
    '#a78bfa',
    '#c084fc',
    '#f472b6',
    '#fb7185',
  ];

  hoveredItem: string | number | null = null;

  accedintType: string[] = [];

  constructor(private mapData: RoadAccidentsService) {}

  ngOnInit(): void {
    mapboxgl as typeof mapboxgl;

    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: this.style,
      zoom: 5,
      center: [30.3351, 59.9343],
    });
    this.map.addControl(
      new mapboxgl.NavigationControl({ showZoom: true, showCompass: false })
    );

    this.map.on('click', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: ['car-accidents'],
      });

      if (!features.length) {
        return;
      }

      const feature: any = features[0];

      this.activeOpt = {
        type: feature.properties?.type || '',
        died: feature.properties?.died || 0,
        wounded: feature.properties?.wounded || 0,
      };
    });

    this.map.on('mousemove', 'car-accidents', (e) => {
      if (e.features?.[0]?.id) {
        this.map.setFeatureState(
          { source: 'accidents', id: e.features?.[0]?.id },
          { hover: true }
        );
        if (this.hoveredItem && this.hoveredItem !== e.features?.[0]?.id) {
          this.map.setFeatureState(
            { source: 'accidents', id: this.hoveredItem },
            { hover: false }
          );
        }
        this.hoveredItem = e.features?.[0]?.id || null;
      }
    });

    this.map.on('mouseleave', 'car-accidents', (e) => {
      if (this.hoveredItem) {
        this.map.setFeatureState(
          { source: 'accidents', id: this.hoveredItem },
          { hover: false }
        );
      }
    });

    this.getData();
  }

  private getData() {
    this.mapData.fetchData().subscribe({
      complete: () => (this.loading = false),
      error: (err) => (this.error = err),
      next: (data: GeojsonPoinCollection<RoadAccidentProperties>) => {
        this.data = data;

        this.error = '';

        const tempTypes: string[] = [];
        for (let { properties } of data.features) {
          if (!tempTypes.includes(properties.type))
            tempTypes.push(properties.type);
        }
        this.accedintType = tempTypes.sort();

        this.loadMapData();
      },
    });
  }

  private loadMapData() {
    this.map.on('load', () => {
      this.map.addSource('accidents', {
        type: 'geojson',
        data: this.data,
        generateId: true,
      });

      const tempCase: string[] = [];

      for (let i = 0; i < this.accedintType.length; i++) {
        tempCase.push(this.accedintType[i]);
        tempCase.push(this.colorsList[i]);
      }

      this.map.addLayer({
        id: 'car-accidents',
        type: 'circle',
        source: 'accidents',

        paint: {
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            15,
            10,
          ],
          'circle-color': ['match', ['get', 'type'], ...tempCase, '#000000'],
          'circle-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5,
          ],
          'circle-stroke-color': '#94a3b8',
          'circle-stroke-width': 1,
        },
      });

      const bounds = this.getExtentJSONLayer(this.data);

      this.map.fitBounds(bounds, { padding: 100 });
    });
  }

  private getExtentJSONLayer(
    data: GeojsonPoinCollection<any>
  ): [number, number, number, number] {
    const max: [number, number] = [-180, -90];
    const min: [number, number] = [180, 90];
    for (let { geometry } of data.features) {
      if (geometry.coordinates[0] > max[0]) max[0] = geometry.coordinates[0];
      if (geometry.coordinates[1] > max[1]) max[1] = geometry.coordinates[1];

      if (geometry.coordinates[0] < min[0]) min[0] = geometry.coordinates[0];
      if (geometry.coordinates[1] < min[1]) min[1] = geometry.coordinates[1];
    }

    return [...min, ...max];
  }

  selectionHandler(type: string) {
    if (type === 'all') {
      this.map.setFilter('car-accidents', null);
    } else {
      this.map.setFilter('car-accidents', ['==', 'type', type]);
    }
  }
}
