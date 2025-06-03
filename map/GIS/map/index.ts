import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

document.addEventListener('DOMContentLoaded', function () {
    const mapDiv = document.getElementById('map');
    const map = new Map({
        // @ts-expect-error TS2322
        target: mapDiv,
        layers: [
            new TileLayer({
                source: new OSM()
            })
        ],
        view: new View({
            center: fromLonLat([0, 0]),
            zoom: 2
        })
    });
});


fetch('/api/example')
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });