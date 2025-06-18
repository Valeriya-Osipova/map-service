import customCheckboxSass from './custom-checkbox.module.scss';

export interface CustomCheckboxParams {
  root: HTMLElement;
  className?: string;
  classNameLabel?: string;
  checked?: boolean;
  id?: string;
  labelText?: string;
  name?: string;
  callback?: (e) => void;
  isDisabled?: boolean;
  data?: string;
}

export class CustomCheckbox {
  get checked() {
    return this.checkbox.checked;
  }

  set checked(val: boolean) {
    this.checkbox.checked = val;
  }

  private checkbox: HTMLInputElement;
  private callback: (e) => void;
  private _checked: boolean;
  private id: string;
  private labelText: string;
  private name: string;
  private classNameLabel: string;
  private _disabled: boolean;

  constructor(params: CustomCheckboxParams) {
    this._checked = params?.checked ? params?.checked : false;
    this._disabled = params?.isDisabled ?? false;
    this.id = params?.id ? params.id : `checkbox-${String(new Date().getTime() + Math.random())}`;
    this.labelText = params?.labelText ? params?.labelText : '';
    this.name = params?.name;
    this.classNameLabel = params?.classNameLabel;
    this.callback = params?.callback;

    this.checkbox = params?.root.appendChild(document.createElement('input'));
    this.checkbox.className =
      params?.className !== undefined
        ? `${customCheckboxSass.customCheckbox} ${params?.className}`
        : customCheckboxSass.customCheckbox;

    this.checkbox.type = 'checkbox';
    this.checkbox.id = this.id;
    this.checkbox.name = this.name;
    this.checkbox.checked = this._checked;
    this.checkbox.addEventListener('change', (e) => {
      if (this.callback) {
        this.callback(e);
      }
    });
    this.checkbox.value = params?.data;
    this.checkbox.disabled = this._disabled;
    const accessDetailsLabel = params?.root.appendChild(document.createElement('label'));
    accessDetailsLabel.className = `${this.classNameLabel} ${customCheckboxSass['custom-label']}`;
    accessDetailsLabel.innerHTML = this.labelText;
    accessDetailsLabel.setAttribute('for', this.id);
  }

  set disabled(value: boolean) {
    this._disabled = value;
    this.checkbox.disabled = this._disabled;
  }
}
