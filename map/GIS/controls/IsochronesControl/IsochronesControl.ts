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
import HelpTooltip from '../../components/HelpTooltip/HelpTooltip';
import { CustomCheckbox } from '../../components/CustomCheckbox/CustomCheckbox';

export class IsochroneControl {
  private container: HTMLDivElement;
  private orsService: OpenRouteService;
  private pointLayer: VectorLayer<VectorSource>;
  private pointSource: VectorSource;
  private cursorTooltip: HelpTooltip;
  private range_type: 'time' | 'distance' = 'time';

  constructor(
    private map: Map,
    private parentContainer: HTMLElement,
  ) {
    this.orsService = new OpenRouteService(map);
    this.container = document.createElement('div');
    this.container.className = Styles.isochroneContainer;
    this.cursorTooltip = new HelpTooltip(this.map);

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

    const checkboxWrapper = controlsContainer.appendChild(document.createElement('div'));
    checkboxWrapper.className = Styles.checkboxWrapper;

    const checkbox = new CustomCheckbox({
      root: checkboxWrapper,
      labelText: 'Построить по расстоянию',
      callback: () => {
        if (checkbox.checked) {
          timeIsochrones.style.display = 'none';
          distanceIsochrones.style.display = 'block';
          this.range_type = 'distance';
        } else {
          timeIsochrones.style.display = 'flex';
          distanceIsochrones.style.display = 'none';
          this.range_type = 'time';
        }
      },
    });

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

    const timeIsochrones = controlsContainer.appendChild(document.createElement('div'));
    timeIsochrones.style.display = 'flex';
    timeIsochrones.style.flexDirection = 'column';
    timeIsochrones.style.gap = '15px';

    const timeInput = new CustomInput({
      root: timeIsochrones,
      labelText: 'Время (мин)',
      type: 'number',
      value: '15',
      min: '1',
      maxlength: 3,
    });

    const distanceIsochrones = controlsContainer.appendChild(document.createElement('div'));
    distanceIsochrones.style.display = 'none';

    const distanceInput = new CustomInput({
      root: distanceIsochrones,
      labelText: 'Расстояние (метры)',
      value: '100',
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

    const mapClicker = pointsContainer.appendChild(document.createElement('div'));
    mapClicker.className = Styles.mapClicker;
    mapClicker.title = 'Выбрать точку на карте';

    mapClicker.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.325C11.7667 21.325 11.5333 21.2833 11.3 21.2C11.0667 21.1167 10.8583 20.9917 10.675 20.825C9.59167 19.825 8.63333 18.85 7.8 17.9C6.96667 16.95 6.27083 16.0292 5.7125 15.1375C5.15417 14.2458 4.72917 13.3875 4.4375 12.5625C4.14583 11.7375 4 10.95 4 10.2C4 7.7 4.80417 5.70833 6.4125 4.225C8.02083 2.74167 9.88333 2 12 2C14.1167 2 15.9792 2.74167 17.5875 4.225C19.1958 5.70833 20 7.7 20 10.2C20 10.95 19.8542 11.7375 19.5625 12.5625C19.2708 13.3875 18.8458 14.2458 18.2875 15.1375C17.7292 16.0292 17.0333 16.95 16.2 17.9C15.3667 18.85 14.4083 19.825 13.325 20.825C13.1417 20.9917 12.9333 21.1167 12.7 21.2C12.4667 21.2833 12.2333 21.325 12 21.325ZM12 12C12.55 12 13.0208 11.8042 13.4125 11.4125C13.8042 11.0208 14 10.55 14 10C14 9.45 13.8042 8.97917 13.4125 8.5875C13.0208 8.19583 12.55 8 12 8C11.45 8 10.9792 8.19583 10.5875 8.5875C10.1958 8.97917 10 9.45 10 10C10 10.55 10.1958 11.0208 10.5875 11.4125C10.9792 11.8042 11.45 12 12 12Z" fill="currentColor"/>
    </svg>
  `;

    mapClicker.addEventListener('click', () => {
      mapClicker.classList.add(Styles.active);
      this.cursorTooltip.createHelpTooltip('Укажите точку');

      this.map.once('singleclick', (e) => {
        mapClicker.classList.remove(Styles.active);
        this.cursorTooltip.removeHelpTooltip();

        const [longitude, latitude] = toLonLat(e.coordinate);

        longitudeInput.value = longitude.toFixed(3);
        latitudeInput.value = latitude.toFixed(3);
      });
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
          const distance = Number(distanceInput.value);
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

          console.log(this.range_type);

          if (this.range_type === 'time') {
            await this.orsService.createIsochrone([lon, lat], profile, time, 'time');
          } else {
            await this.orsService.createIsochrone([lon, lat], profile, distance, 'distance');
          }
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
