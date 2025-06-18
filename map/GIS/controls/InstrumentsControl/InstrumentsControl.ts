import { CustomInput } from '../../components/CustomInput/CustomInput';
import Map from 'ol/Map';
import { IsochroneControl } from '../IsochronesControl/IsochronesControl';
import Instruments from './instruments-control.module.scss';

export interface InstrumentsControlOptions {
  root: HTMLElement;
  map: Map;
}

export class InstrumentsControl {
  private container: HTMLElement;
  private map: Map;
  private isochroneControl: IsochroneControl;

  constructor(parameters: InstrumentsControlOptions) {
    this.container = parameters.root;
    this.map = parameters.map;
    this.init();
  }

  init() {
    const instrunemtsContainer = this.container.appendChild(document.createElement('div'));
    new CustomInput({
      root: instrunemtsContainer,
      labelText: 'Поиск объектов',
      placeholder: 'Введите текст...',
    });
    instrunemtsContainer.style.marginBottom = '35px';

    const instrumentsBlock = this.container.appendChild(document.createElement('div'));
    instrumentsBlock.style.marginBottom = '60px';

    const header = instrumentsBlock.appendChild(document.createElement('div'));
    header.innerText = 'Инструменты';
    header.className = Instruments.header;

    let isOpen = false;

    const isochronesBlock = instrumentsBlock.appendChild(document.createElement('div'));
    isochronesBlock.textContent = 'Построение изохрон';
    isochronesBlock.className = Instruments.item;
    const content = instrumentsBlock.appendChild(document.createElement('div'));
    isochronesBlock.addEventListener('click', () => {
      if (!isOpen) {
        this.isochroneControl = new IsochroneControl(this.map, content);
      }
      isOpen = true;
    });

    const instArray = [
      'Рассчет зон интереса',
      'Рассчет площади объектов',
      'Рассчет маршрута',
      'Импорт слоев',
      'Построение объектов',
    ];
    instArray.forEach((item) => {
      const itemInst = instrumentsBlock.appendChild(document.createElement('div'));
      itemInst.innerText = item;
      itemInst.className = Instruments.item;
    });
  }

  static builder(opts: InstrumentsControlOptions) {
    new InstrumentsControl(opts);
  }
}
