import CustomInputStyles from './custom-input.module.scss';

export interface CustomInputParams {
  root: HTMLElement;
  id?: string;
  labelText?: string;
  name?: string;
  type?: string;
  min?: string;
  step?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  requiredText?: string;
  disabled?: boolean;
  className?: string;
  readonly?: boolean;
  inputText?: string;
  setFloat?: number;
  setInt?: boolean;
  hidden?: boolean;
  maxlength?: number;
  listener?: (e) => void;
  onChange?: (value: string) => void;
}

export class CustomInput {
  set value(text: string) {
    this.input.value = text;
  }
  get value(): string | null | undefined {
    return this.input.value;
  }
  get classList(): DOMTokenList {
    return this.input.classList;
  }

  set disabled(val: boolean) {
    this.input.disabled = val;
    this.inputText.disabled = val;
  }
  get disabled(): boolean {
    return this.input.disabled;
  }

  set requiredErr(val: boolean) {
    if (this.errMsg) {
      this.errMsg.style.display = val ? 'block' : 'none';
    }
    this.input.style.border = val ? '1px solid #BC000A' : '1px solid #c4c4c4';
  }

  set labelText(val: string) {
    this.label.innerHTML = `${val} ${this._required ? `<span class='${CustomInputStyles.required}'>*</span>` : ''}`;
  }

  set required(val: boolean) {
    this._required = val;
  }

  get element() {
    return this.input;
  }

  set hidden(val: boolean) {
    this.container.style.display = val ? 'none' : 'block';
  }

  private container: HTMLElement;
  private id: string;
  private _labelText: string;
  private name: string;
  private placeholder: string;
  private type: string;
  private min: string;
  private step: string;
  private _value: string;
  private input: HTMLInputElement;
  private inputText: HTMLInputElement;
  private label: HTMLLabelElement;
  private errMsg: HTMLLabelElement;
  private _disabled: boolean;
  private _required: boolean;
  private _requiredText: string;
  private readonly: boolean;
  private maxlength: number;
  private icon: Array<{
    icon: HTMLElement;
    iconCallback?: (e, input: HTMLInputElement, inputText: HTMLInputElement) => void;
  }>;

  constructor(params: CustomInputParams) {
    this.id = params.id ? params.id : String(new Date().getTime());
    this._labelText = params?.labelText;
    this.placeholder = params?.placeholder ?? '';
    this.name = params?.name;
    this.type = params?.type;
    this.min = params?.min;
    this.step = params?.step;
    this.maxlength = params?.maxlength;
    this._value = params?.value;
    this._disabled = params?.disabled ?? false;
    this._required = params?.required ?? false;
    this._requiredText = params?.requiredText ?? null;
    this.readonly = params?.readonly ?? false;

    this.container = params?.root.appendChild(document.createElement('div'));
    this.container.className =
      params?.className !== undefined
        ? `${CustomInputStyles.inputWrapper} ${params?.className}`
        : CustomInputStyles.inputWrapper;

    this.input = document.createElement('input');
    this.inputText = document.createElement('input');

    if (this._labelText) {
      this.label = this.container.appendChild(document.createElement('label'));
      this.label.innerHTML = `${this._labelText} ${this._required ? `<span class='${CustomInputStyles.required}'>*</span>` : ''}`;
      this.label.setAttribute('for', this.id);
    }

    this.container.appendChild(this.input);
    this.input.type = this.type ?? 'text';
    this.input.min = this.min;
    this.input.step = this.step;
    this.input.disabled = this._disabled;
    this.input.readOnly = this.readonly;
    this.input.placeholder = this.placeholder;
    if (this.input.min) {
      const min = parseFloat(this.input.min);
      this.input.addEventListener('input', function () {
        const value = parseFloat(this.value);
        if (value < min && value !== 0) {
          // чтобы вручную вводить 0.
          this.value = `${min}`; // устанавливаем минимальное значение
        }
      });
      this.input.addEventListener('blur', function () {
        const value = parseFloat(this.value);
        if (value < min) {
          this.value = `${min}`; // устанавливаем минимальное значение
        }
      });
    }
    if (this._required && this._requiredText) {
      this.errMsg = this.container.appendChild(document.createElement('label'));
      this.errMsg.style.display = 'none';
      this.errMsg.style.paddingTop = '2px';
      this.errMsg.style.color = '#BC000A';
      this.errMsg.innerText = this._requiredText;
      this.input.addEventListener('input', (e) => {
        if ((e.target as HTMLInputElement).value.length === 0) {
          this.errMsg.style.display = 'block';
          this.input.style.border = '1px solid #BC000A';
        } else {
          this.errMsg.style.display = 'none';
          this.input.style = '';
        }
      });
    }
    if (this.readonly) {
      this.input.style.cursor = 'default';
    }
    if (this.name) {
      this.input.name = this.name;
    }
    this.input.id = this.id;
    if (this._value) {
      this.input.value = this.min && this._value < this.min ? this.min : this._value;
    }
    if (params?.hidden) {
      this.input.style.display = 'none';
    }
    if (params?.listener) {
      this.input.addEventListener('input', (e) => params.listener(e));
    }
    if (this.maxlength) {
      this.input.maxLength = this.maxlength;
    }
    if (params?.onChange) {
      this.input.addEventListener('change', () => {
        params.onChange(this.input.value);
      });
    }
    this.input.addEventListener('focusout', () => (this.input.value = this.input.value.trim()));
  }
}
