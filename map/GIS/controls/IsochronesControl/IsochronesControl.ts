import Map from 'ol/Map';
import { fromLonLat, toLonLat } from 'ol/proj';
import Styles from './isochronesControl.module.scss';
import { OpenRouteService } from '../../services/OpenRouteService/OpenRouteService';
import { CustomButton } from '../../components/CustomButton/CustomButton';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import CircleStyle from 'ol/style/Circle';

export class IsochroneControl {
  private container: HTMLDivElement;
  private orsService: OpenRouteService;
  private pointLayer: VectorLayer<VectorSource>;
  private pointSource: VectorSource;

  constructor(
    private map: Map,
    private parentContainer: HTMLElement,
  ) {
    this.orsService = new OpenRouteService(map);
    this.container = document.createElement('div');
    this.container.className = Styles.isochroneContainer;

    this.pointSource = new VectorSource();
    this.pointLayer = new VectorLayer({
      source: this.pointSource,
      style: new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({
            color: 'rgba(32,167,154, 0.8)',
          }),
          stroke: new Stroke({
            color: 'white',
            width: 2.5,
          }),
        }),
      }),
      zIndex: 1000,
    });
    this.map.addLayer(this.pointLayer);

    this.render();
  }

  private render() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'isochrone-controls';

    const header = document.createElement('h3');
    header.className = 'isochrone-header';
    header.textContent = 'Построение изохрон';
    controlsContainer.appendChild(header);

    const transportGroup = document.createElement('div');
    transportGroup.className = Styles.transportGroup;

    const transportLabel = document.createElement('label');
    transportLabel.textContent = 'Тип транспорта:';
    transportLabel.htmlFor = 'transport-select';
    transportLabel.style.paddingRight = '5px';
    transportGroup.appendChild(transportLabel);

    const transportSelect = document.createElement('select');
    transportSelect.id = 'transport-select';
    transportSelect.className = 'transport-select';

    const profiles = [
      { value: 'foot-walking', label: 'Пешком' },
      { value: 'cycling-regular', label: 'Велосипед' },
      { value: 'driving-car', label: 'Автомобиль' },
    ];

    profiles.forEach((profile) => {
      const option = document.createElement('option');
      option.value = profile.value;
      option.textContent = profile.label;
      transportSelect.appendChild(option);
    });

    transportGroup.appendChild(transportSelect);
    controlsContainer.appendChild(transportGroup);

    const timeGroup = document.createElement('div');
    timeGroup.className = Styles.timeGroup;

    const timeLabel = document.createElement('label');
    timeLabel.textContent = 'Время (мин):';
    timeLabel.htmlFor = 'time-input';
    timeLabel.style.paddingRight = '5px';
    timeGroup.appendChild(timeLabel);

    const timeInput = document.createElement('input');
    timeInput.id = 'time-input';
    timeInput.className = 'time-input';
    timeInput.type = 'number';
    timeInput.value = '15';
    timeInput.min = '1';
    timeInput.max = '120';
    timeInput.step = '1';
    timeGroup.appendChild(timeInput);
    controlsContainer.appendChild(timeGroup);

    const longitudeGroup = controlsContainer.appendChild(document.createElement('div'));
    longitudeGroup.style.paddingBottom = '10px';

    const longitudeLabel = longitudeGroup.appendChild(document.createElement('label'));
    longitudeLabel.textContent = 'Долгота';
    longitudeLabel.htmlFor = 'longitude-input';
    longitudeLabel.style.paddingRight = '5px';

    const longitudeInput = longitudeGroup.appendChild(document.createElement('input'));
    longitudeInput.className = 'longitude-input';
    longitudeInput.type = 'text';
    longitudeInput.value = '30.337';

    const latitudeGroup = controlsContainer.appendChild(document.createElement('div'));

    const latitudeLabel = latitudeGroup.appendChild(document.createElement('label'));
    latitudeLabel.textContent = 'Широта';
    latitudeLabel.htmlFor = 'latitude-input';
    latitudeLabel.style.paddingRight = '5px';

    const latitudeInput = latitudeGroup.appendChild(document.createElement('input'));
    latitudeInput.className = 'latitude-input';
    latitudeInput.type = 'text';
    latitudeInput.value = '59.932';

    const buttonContainer = controlsContainer.appendChild(document.createElement('div'));
    buttonContainer.className = Styles.buttonContainer;

    const buildButton = new CustomButton({
      root: buttonContainer,
      text: 'Построить',
      clickHandler: async () => {
        try {
          const lon = Number(longitudeInput.value);
          const lat = Number(latitudeInput.value);
          const time = Number(timeInput.value);
          const profile = transportSelect.value as
            | 'foot-walking'
            | 'driving-car'
            | 'cycling-regular';

          this.pointSource.clear();

          const point = new Point(fromLonLat([lon, lat]));
          const marker = new Feature({
            geometry: point,
            name: 'Точка построения',
          });
          this.pointLayer.setVisible(true);
          this.pointSource.addFeature(marker);

          console.log(this.pointSource.getFeatures());

          await this.orsService.createIsochrone([lon, lat], profile, time);
        } catch (error) {
          console.error('Ошибка при построении изохроны:', error);
          alert('Не удалось построить изохрону. Проверьте параметры и попробуйте снова.');
        }
      },
    });

    this.container.innerHTML = '';
    this.container.appendChild(controlsContainer);
    this.parentContainer.appendChild(this.container);
  }
}
