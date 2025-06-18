import { EventsKey } from 'ol/events.js';
import Map from 'ol/Map.js';
import { unByKey } from 'ol/Observable.js';
import Overlay from 'ol/Overlay.js';
import helpTooltipSass from './help-tooltip.module.scss';

class HelpTooltip {
  private _map: Map;
  private _helpTooltipElement: HTMLDivElement;
  private _helpTooltip: Overlay;
  private moveHandlerKey: EventsKey;
  /**
   * Класс для создания информационных сообщений
   * @param map Объекты карты
   * @param [params] {*} Доп параметры
   */
  constructor(map: Map) {
    this._map = map;
    this._helpTooltipElement = null;
    this._helpTooltip = null;
    this.moveHandlerKey = null;
  }

  /**
   * Создает и размещает возле курсора сообщение
   * @param message
   */
  createHelpTooltip(message) {
    this.removeHelpTooltip();
    this._helpTooltipElement = document.createElement('div');
    this._helpTooltipElement.className = `${helpTooltipSass.tooltip} ${helpTooltipSass.hidden}`;
    this._helpTooltipElement.innerHTML = message;
    this._helpTooltip = new Overlay({
      element: this._helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left',
      stopEvent: false,
    });
    this._map.addOverlay(this._helpTooltip);
    this.moveHandlerKey = this._map.on('pointermove', this._handleMouseMove.bind(this));
    this._map.getViewport().addEventListener('mouseout', this._handleMouseOut.bind(this), false);
  }

  /**
   * Удаляет информационное сообщение
   */
  removeHelpTooltip() {
    if (this._helpTooltipElement) {
      this._map.removeOverlay(this._helpTooltip);
      this._helpTooltipElement.parentNode.removeChild(this._helpTooltipElement);
      this._helpTooltipElement = null;
    }

    if (this.moveHandlerKey) {
      unByKey(this.moveHandlerKey);
      this.moveHandlerKey = null;
    }
    this._map.getViewport().removeEventListener('mouseout', this._handleMouseOut, false);
  }

  /**
   * Изменяет выводимое сообщение
   * @param message
   */
  changeMessage(message) {
    if (this._helpTooltipElement) {
      this._helpTooltipElement.innerHTML = message;
    }
  }

  getMessage() {
    if (this._helpTooltipElement) {
      return this._helpTooltipElement.innerHTML;
    }
    return null;
  }

  /**
   * Создает тултип с часиками
   */
  createIdleTooltip() {
    const idleNode = document.createElement('div');
    this.createHelpTooltip(idleNode.innerHTML);
  }

  /**
   * Обработчик выхода мыши за границы карты
   */
  _handleMouseOut() {
    if (this._helpTooltipElement) {
      this._helpTooltipElement.classList.add(helpTooltipSass.hidden);
    }
  }

  _handleMouseMove(evt) {
    if (evt.dragging) {
      return;
    }

    this._helpTooltip.setPosition(evt.coordinate);
    this._helpTooltipElement.classList.remove(helpTooltipSass.hidden);
  }
}

export default HelpTooltip;
