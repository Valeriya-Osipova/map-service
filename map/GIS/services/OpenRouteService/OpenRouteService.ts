// src/services/OpenRouteService.ts
import { Feature, FeatureCollection, Polygon } from 'geojson';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import Map from 'ol/Map';
import { config } from '../../../config';

interface OpenRouteIsochroneResponse {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      value: number;
      group_index: number;
    };
  }>;
}

interface IsochroneOptions {
  rangeType?: 'time' | 'distance';
  intervals?: number;
  attributes?: string[];
  avoid_features?: ('highways' | 'tollways' | 'ferries')[];
  avoid_polygons?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}
export class OpenRouteService {
  private readonly API_KEY = config.openRouteApiKey;
  private readonly BASE_URL = 'https://api.openrouteservice.org/v2/isochrones';

  constructor(private map: Map) {}

  async createIsochrone(
    coordinates: number[][],
    profile: 'foot-walking' | 'driving-car' | 'cycling-regular',
    time: number,
    range_type?: 'time' | 'distance',
    options: IsochroneOptions = {},
  ): Promise<void> {
    try {
      console.log(range_type);

      const requestBody: any = {
        locations: coordinates,
        range: [range_type === 'time' ? time * 60 : time],
        range_type: range_type || 'time',
        location_type: 'start',
        smoothing: 25,
      };

      if (options.intervals) requestBody.interval = options.intervals;
      if (options.attributes) requestBody.attributes = options.attributes;

      if (options.avoid_features || options.avoid_polygons) {
        requestBody.options = {};

        if (options.avoid_features) {
          const validFeatures = options.avoid_features.filter((f) =>
            ['highways', 'tollways', 'ferries'].includes(f),
          );
          requestBody.options.avoid_features = validFeatures;
        }

        if (options.avoid_polygons) {
          requestBody.options.avoid_polygons = options.avoid_polygons;
        }
      }

      const response = await fetch(`${this.BASE_URL}/${profile}`, {
        method: 'POST',
        headers: {
          Authorization: this.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Ошибка при построении изохроны');
      }

      const data: OpenRouteIsochroneResponse = await response.json();

      const geoJson: FeatureCollection<Polygon> = {
        type: 'FeatureCollection',
        features: data.features.map((feature) => ({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            time: feature.properties.value / 60,
            profile: profile,
          },
        })),
      };

      this.addToMap(geoJson, profile);
    } catch (error) {
      console.error('Error creating isochrone:', error);
      throw error;
    }
  }

  private addToMap(geoJson: FeatureCollection<Polygon>, profile: string) {
    this.map.getLayers().forEach((layer) => {
      if (layer.get('name') === 'isochrone') {
        this.map.removeLayer(layer);
      }
    });

    const colors: Record<string, string> = {
      'foot-walking': '#4CAF50',
      'cycling-regular': '#2196F3',
      'driving-car': '#FF5722',
    };

    const format = new GeoJSON();
    const features = format.readFeatures(geoJson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    const source = new VectorSource({ features });
    const layer = new VectorLayer({
      source,
      style: new Style({
        stroke: new Stroke({
          color: colors[profile],
          width: 2,
        }),
        fill: new Fill({
          color: `${colors[profile]}33`,
        }),
      }),
      properties: { name: 'isochrone' },
    });

    this.map.addLayer(layer);
  }
}
