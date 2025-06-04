import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { CustomButton } from '../components/CustomButton/CustomButton';

document.addEventListener('DOMContentLoaded', function () {
  const mapDiv = document.getElementById('map');
  const map = new Map({
    // @ts-expect-error TS2322
    target: mapDiv,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat([0, 0]),
      zoom: 3,
    }),
  });
  const authDiv = document.getElementById('auth');
  if (!authDiv) return;
  createAuthButtons(authDiv);
});

function createAuthButtons(container: HTMLElement) {
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '30px';

  new CustomButton({
    root: buttonContainer,
    text: 'Войти',
    variant: 'default',
    clickHandler: () => console.log('Clicked!'),
  });

  new CustomButton({
    root: buttonContainer,
    text: 'Зарегистрироваться',
    variant: 'default',
    clickHandler: () => console.log('Clicked!'),
  });

  container.appendChild(buttonContainer);
}

fetch('/api/example')
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });
