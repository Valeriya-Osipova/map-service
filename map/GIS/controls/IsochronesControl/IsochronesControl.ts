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
import { FeatureCollection, Polygon } from 'geojson';

export class IsochroneControl {
  private container: HTMLDivElement;
  private orsService: OpenRouteService;
  private pointLayer: VectorLayer<VectorSource>;
  private pointSource: VectorSource;
  private tempPointLayer: VectorLayer<VectorSource>;
  private tempPointSource: VectorSource;
  private cursorTooltip: HelpTooltip;
  private range_type: 'time' | 'distance' = 'time';
  private pointsArr: Array<{
    lonInput: HTMLInputElement;
    latInput: HTMLInputElement;
    deleteBtn: HTMLElement;
  }> = [];

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

    this.tempPointSource = new VectorSource();
    this.tempPointLayer = new VectorLayer({
      source: this.tempPointSource,
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.57)',
          }),
          stroke: new Stroke({
            color: 'white',
            width: 2.5,
          }),
        }),
      }),
      zIndex: 999,
    });
    this.map.addLayer(this.pointLayer);
    this.map.addLayer(this.tempPointLayer);

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
      value: '200',
    });

    const pointsContainer = controlsContainer.appendChild(document.createElement('div'));

    this.createPointInputs(pointsContainer, '30.337', '59.932');
    const addButtonContainer = controlsContainer.appendChild(document.createElement('div'));
    const addButton = new CustomButton({
      root: addButtonContainer,
      text: 'Добавить точку',
      variant: 'white',
      clickHandler: () => {
        this.createPointInputs(pointsContainer);
      },
    });

    const buttonContainer = controlsContainer.appendChild(document.createElement('div'));
    buttonContainer.className = Styles.buttonContainer;

    const buildButton = new CustomButton({
      root: buttonContainer,
      text: 'Построить',
      clickHandler: async () => {
        try {
          const coordinates = this.pointsArr.map((point) => [
            Number(point.lonInput.value),
            Number(point.latInput.value),
          ]);

          if (
            coordinates.some(
              (coord) => isNaN(coord[0]) || isNaN(coord[1]) || coord[0] === 0 || coord[1] === 0,
            )
          ) {
            throw new Error('Не все координаты заполнены корректно');
          }
          const time = Number(timeInput.value);
          const distance = Number(distanceInput.value);
          const profile = transportSelect.getSelectedItem.value as
            | 'foot-walking'
            | 'driving-car'
            | 'cycling-regular';

          this.pointSource.clear();

          coordinates.forEach((coord) => {
            const point = new Point(fromLonLat(coord));
            const marker = new Feature({
              geometry: point,
              name: 'Точка построения',
            });
            this.pointSource.addFeature(marker);
          });

          this.pointLayer.setVisible(true);
          let geoJSONResp;

          if (this.range_type === 'time') {
            geoJSONResp = await this.orsService.createIsochrone(coordinates, profile, time, 'time');
          } else {
            geoJSONResp = await this.orsService.createIsochrone(
              coordinates,
              profile,
              distance,
              'distance',
            );
          }

          const oldExportBtn = document.getElementById('export-button');
          if (oldExportBtn) {
            oldExportBtn.remove();
          }

          const exportButton = new CustomButton({
            root: buttonContainer,
            className: Styles.exportBtn,
            id: 'export-button',
            text: 'Экспорт GeoJSON',
            variant: 'white',
            clickHandler: () => {
              this.downloadGeoJSON(geoJSONResp);
            },
          });
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

  private createPointInputs(container: HTMLElement, lonValue: string = '', latValue: string = '') {
    const pointContainer = container.appendChild(document.createElement('div'));
    pointContainer.className = Styles.pointsContainer;

    const lonInput = new CustomInput({
      root: pointContainer,
      labelText: 'Долгота',
      value: lonValue,
      placeholder: 'Введите долготу',
    });

    const latInput = new CustomInput({
      root: pointContainer,
      labelText: 'Широта',
      value: latValue,
      placeholder: 'Введите широту',
    });

    const mapClicker = pointContainer.appendChild(document.createElement('div'));
    mapClicker.className = Styles.mapClicker;
    mapClicker.title = 'Выбрать точку на карте';
    mapClicker.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.325C11.7667 21.325 11.5333 21.2833 11.3 21.2C11.0667 21.1167 10.8583 20.9917 10.675 20.825C9.59167 19.825 8.63333 18.85 7.8 17.9C6.96667 16.95 6.27083 16.0292 5.7125 15.1375C5.15417 14.2458 4.72917 13.3875 4.4375 12.5625C4.14583 11.7375 4 10.95 4 10.2C4 7.7 4.80417 5.70833 6.4125 4.225C8.02083 2.74167 9.88333 2 12 2C14.1167 2 15.9792 2.74167 17.5875 4.225C19.1958 5.70833 20 7.7 20 10.2C20 10.95 19.8542 11.7375 19.5625 12.5625C19.2708 13.3875 18.8458 14.2458 18.2875 15.1375C17.7292 16.0292 17.0333 16.95 16.2 17.9C15.3667 18.85 14.4083 19.825 13.325 20.825C13.1417 20.9917 12.9333 21.1167 12.7 21.2C12.4667 21.2833 12.2333 21.325 12 21.325ZM12 12C12.55 12 13.0208 11.8042 13.4125 11.4125C13.8042 11.0208 14 10.55 14 10C14 9.45 13.8042 8.97917 13.4125 8.5875C13.0208 8.19583 12.55 8 12 8C11.45 8 10.9792 8.19583 10.5875 8.5875C10.1958 8.97917 10 9.45 10 10C10 10.55 10.1958 11.0208 10.5875 11.4125C10.9792 11.8042 11.45 12 12 12Z" fill="currentColor"/>
      </svg>
    `;

    mapClicker.addEventListener('click', () => {
      mapClicker.classList.add(Styles.active);
      this.cursorTooltip.createHelpTooltip('Укажите точку на карте');

      this.map.once('singleclick', (e) => {
        const coordinate = e.coordinate;
        mapClicker.classList.remove(Styles.active);
        this.cursorTooltip.removeHelpTooltip();
        const [longitude, latitude] = toLonLat(coordinate);

        const tempPoint = new Point(coordinate);
        const tempMarker = new Feature({
          geometry: tempPoint,
          name: 'Предпросмотр точки',
        });
        this.tempPointSource.addFeature(tempMarker);

        lonInput.value = longitude.toFixed(3);
        latInput.value = latitude.toFixed(3);

        setTimeout(() => {
          this.tempPointSource.clear();
        }, 3000);
      });
    });

    const deleteBtn = pointContainer.appendChild(document.createElement('div'));
    deleteBtn.className = Styles.deleteBtn;
    deleteBtn.title = 'Удалить точку';
    deleteBtn.innerHTML = `<svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14ZM10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14Z" fill="currentColor"/>
</svg>`;

    if (this.pointsArr.length < 1) {
      deleteBtn.classList.add(Styles.disable);
    }

    deleteBtn.addEventListener('click', () => {
      pointContainer.remove();

      const index = this.pointsArr.findIndex(
        (point) =>
          point.lonInput === lonInput.inputElement && point.latInput === latInput.inputElement,
      );
      if (index !== -1) {
        this.pointsArr.splice(index, 1);
      }
      this.updateDeleteButtons();
    });

    this.pointsArr.push({
      lonInput: lonInput.inputElement,
      latInput: latInput.inputElement,
      deleteBtn: deleteBtn,
    });
    this.updateDeleteButtons();
  }

  private downloadGeoJSON(geoJson: FeatureCollection<Polygon>) {
    const dataStr = JSON.stringify(geoJson, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `isochrone_${new Date().toISOString().slice(0, 10)}.geojson`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  private updateDeleteButtons() {
    this.pointsArr.forEach((point, index) => {
      if (point.deleteBtn) {
        if (this.pointsArr.length > 1) {
          point.deleteBtn.classList.remove(Styles.disable);
        } else {
          point.deleteBtn.classList.add(Styles.disable);
        }
      }
    });
  }
}
