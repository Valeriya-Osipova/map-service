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
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import { CustomInput } from '../../components/CustomInput/CustomInput';

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
    controlsContainer.className = Styles.isochroneControl;

    const header = document.createElement('h3');
    header.className = 'isochrone-header';
    header.textContent = 'Построение изохрон';
    controlsContainer.appendChild(header);

    const profiles = [
      {
        title: 'Пешком',
        value: 'foot-walking',
      },
      {
        title: 'Велосипед',
        value: 'cycling-regular',
      },
      {
        title: 'Автомобиль',
        value: 'driving-car',
      },
    ];

    const transportSelect = new CustomSelect({
      root: controlsContainer,
      label: 'Тип транспорта:',
      items: profiles,
      defaultValue: 'foot-walking',
    });

    const timeInput = new CustomInput({
      root: controlsContainer,
      labelText: 'Время (мин)',
      type: 'number',
      value: '15',
      min: '1',
      maxlength: 3,
    });

    const pointsContainer = controlsContainer.appendChild(document.createElement('div'));
    pointsContainer.className = Styles.pointsContainer;

    const longitudeInput = new CustomInput({
      root: pointsContainer,
      labelText: 'Долгота',
      value: '30.337',
    });

    const latitudeInput = new CustomInput({
      root: pointsContainer,
      labelText: 'Широта',
      value: '59.932',
    });

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
          const profile = transportSelect.getSelectedItem.value as
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
