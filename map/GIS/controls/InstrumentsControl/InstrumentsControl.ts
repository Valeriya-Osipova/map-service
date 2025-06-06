import { CustomInput } from '../../components/CustomInput/CustomInput';

export interface InstrumentsControlOptions {
  root: HTMLElement;
}

export class InstrumentsControl {
  private container: HTMLElement;

  constructor(parameters: InstrumentsControlOptions) {
    this.container = parameters.root;
    this.init();
  }

  init() {
    const instrunemtsContainer = this.container.appendChild(document.createElement('div'));
    new CustomInput({
      root: instrunemtsContainer,
      labelText: 'Поиск объектов',
      placeholder: 'Введите текст...',
    });
  }

  static builder(opts: InstrumentsControlOptions) {
    new InstrumentsControl(opts);
  }
}
