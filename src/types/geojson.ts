//only 2d and point

export type FeaturePoint<Properties> = {
  type: 'Feature';
  id?: string | number;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: Properties;
};

export type GeojsonPoinCollection<Properties> = {
  type: 'FeatureCollection';
  features: FeaturePoint<Properties>[];
};

export type RoadAccidentProperties = {
  type: string;
  died: number;
  wounded: number;
};
