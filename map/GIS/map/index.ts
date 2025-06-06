import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { toLonLat, transform } from 'ol/proj';
import { CustomButton } from '../components/CustomButton/CustomButton';
import { InstrumentsControl } from '../controls/InstrumentsControl/InstrumentsControl';

document.addEventListener('DOMContentLoaded', function () {
  init();
});

function init() {
  const mapDiv = document.getElementById('map');
  const map = new Map({
    target: mapDiv,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: [3374804.6, 8385939.7],
      zoom: 10,
      projection: 'EPSG:3857',
    }),
  });
  const authDiv = document.getElementById('auth');
  if (authDiv) {
    createAuthButtons(authDiv);
  }

  initFooterControls(map);
  initInstruments();
}

function createAuthButtons(container: HTMLElement) {
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '30px';

  new CustomButton({
    root: buttonContainer,
    text: 'Войти',
    variant: 'default',
    clickHandler: () => {
      window.location.href = '/login';
    },
  });

  new CustomButton({
    root: buttonContainer,
    text: 'Зарегистрироваться',
    variant: 'default',
    clickHandler: () => {
      window.location.href = '/register';
    },
  });

  container.appendChild(buttonContainer);
}

function initInstruments() {
  const instruments = document.getElementById('instruments');
  if (!instruments) return;

  InstrumentsControl.builder({ root: instruments });
}

function initFooterControls(map: Map) {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.style.display = 'flex';
  footer.style.justifyContent = 'center';
  footer.style.alignItems = 'center';
  footer.style.gap = '30px';
  const projDisplay = footer.appendChild(document.createElement('div'));
  const coordsDisplay = footer.appendChild(document.createElement('div'));

  const view = map.getView();
  const mapProjection = view.getProjection();

  projDisplay.textContent = `Проекция: ${mapProjection.getCode()}`;

  map.on('pointermove', (evt) => {
    const lonLat = toLonLat(evt.coordinate, mapProjection);

    coordsDisplay.textContent =
      `Долгота: ${lonLat[0].toFixed(4)}°, Широта: ${lonLat[1].toFixed(4)}° | ` +
      `X: ${evt.coordinate[0].toFixed(2)}, Y: ${evt.coordinate[1].toFixed(2)}`;
  });

  // view.on('change', () => {
  //   projDisplay.textContent = `Проекция: ${view.getProjection().getCode()}`;
  // });
}

fetch('/api/example')
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });
