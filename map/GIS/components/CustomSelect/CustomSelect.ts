import { default as PerfectScrollbar } from 'perfect-scrollbar';
import { default as CustomSelectSass } from './custom-select.module.scss';
import { CustomInput } from '../CustomInput/CustomInput';

interface CustomSelectOption {
  title?: string;
  value?: string;
  hint?: string;
  target?: EventTarget;
}

interface CustomSelectParams {
  items: Array<CustomSelectOption>;
  className?: string;
  root: HTMLElement;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  showItemsCount?: number;
  style?: string;
  disabled?: boolean;
  onSelect?: (item?: CustomSelectOption) => void;
  onInit?: (this: CustomSelect) => void;
  required?: boolean;
  requiredText?: string;
  big?: boolean;
  searchOn?: boolean;
}

/**
 * Компонент выбора из списка
 *
 * @export
 * @class CustomSelect
 */
export class CustomSelect {
  private wrapper: HTMLElement;
  private container: HTMLElement;
  private customSelectTriggerText: HTMLElement;
  private selectedItem: CustomSelectOption;
  private items: Array<CustomSelectOption>;
  private ps: PerfectScrollbar;
  private isOpen = false;
  private showItemsCount = 8;
  private required: boolean;
  private _requiredText: string;
  private errMsg: HTMLLabelElement;
  private big: boolean;
  private onInit?: () => void;
  private errorMessage: HTMLElement;
  private customSelectTrigger: HTMLElement;
  private searchInput: CustomInput;
  private searchOn: boolean;

  set requiredErr(val: boolean) {
    this.errMsg.style.display = val ? 'block' : 'none';
    this.customSelectTrigger.style.border = '1px solid #BC000A';
  }

  set error(error: string) {
    this.errorMessage.textContent = error;
    this.errorMessage.style.display = error === '' ? 'none' : 'block';
  }

  get getSelectedItem(): CustomSelectOption {
    return this.selectedItem;
  }

  set setSelectedItem(value: CustomSelectOption) {
    if (value !== null) {
      this.selectedItem = value;
      this.customSelectTriggerText.textContent = value.title;
      this.customSelectTriggerText.classList.remove(CustomSelectSass.placeholder);
    } else {
      this.selectedItem = null;
      this.customSelectTriggerText.textContent = '';
      this.customSelectTriggerText.classList.add(CustomSelectSass.placeholder);
    }
  }

  get getItems() {
    return this.items;
  }

  set setItems(items: Array<CustomSelectOption>) {
    this.items = items;
  }

  set setValue(value: string) {
    this.items.forEach((item) => {
      if (item.value.toLowerCase() === value.toLowerCase()) {
        this.items
          .filter((f) => f.value.toLowerCase() === value.toLowerCase())
          .forEach((filteredItem) => {
            this.customSelectTriggerText.textContent = filteredItem.title;
            this.selectedItem = { title: filteredItem.title, value: item.value };
          });
      }
    });
  }

  constructor(params: CustomSelectParams) {
    this.required = params.required;
    this.big = params.big;
    this.searchOn = params.searchOn;
    this.items = params?.items.filter((i) => i.value) || [];
    this._requiredText = params?.requiredText ?? null;

    this.container = params?.root.appendChild(document.createElement('div'));
    this.container.className =
      params?.className !== undefined
        ? `${CustomSelectSass.customSelectContainer} ${params?.className}`
        : CustomSelectSass.customSelectContainer;
    if (params?.big) {
      this.container.classList.add(CustomSelectSass.big);
    }
    if (params?.style) {
      this.container.classList.add(params.style);
    }

    if (params?.disabled) {
      this.disable();
    }

    if (params?.label) {
      const customSelectLabel = this.container.appendChild(document.createElement('div'));
      customSelectLabel.className = CustomSelectSass.customSelectLabel;
      customSelectLabel.innerHTML = `${params.label}${this.required ? ` <span class='${CustomSelectSass.required}'>*</span>` : ''}`;
    }

    if (params?.showItemsCount) {
      this.showItemsCount = params?.showItemsCount;
    }

    this.errorMessage = this.container.appendChild(document.createElement('div'));
    this.errorMessage.className = CustomSelectSass.errorMessage;

    this.wrapper = this.container.appendChild(document.createElement('div'));
    this.wrapper.className = CustomSelectSass.customSelectWrapper;
    this.wrapper.addEventListener(
      'click',
      (event: Event) =>
        this.onWrapperClick(
          event,
          this.container,
          customSelect,
          this.customSelectTriggerText,
          params.onSelect,
        ),
      false,
    );

    const customSelect = this.wrapper.appendChild(document.createElement('div'));
    customSelect.className = CustomSelectSass.customSelect;

    this.customSelectTrigger = customSelect.appendChild(document.createElement('div'));
    this.customSelectTrigger.className = CustomSelectSass.customSelectTrigger;
    this.customSelectTriggerText = this.customSelectTrigger.appendChild(
      document.createElement('span'),
    );
    if (params?.placeholder) {
      this.customSelectTriggerText.textContent = params.placeholder;
      this.customSelectTriggerText.classList.add(CustomSelectSass.placeholder);
    }
    if (params?.defaultValue) {
      this.items.forEach((item) => {
        if (item.value.toString().toLowerCase() === params.defaultValue.toString().toLowerCase()) {
          this.items
            .filter(
              (f) =>
                f.value.toString().toLowerCase() === params.defaultValue.toString().toLowerCase(),
            )
            .forEach((filteredItem) => {
              this.customSelectTriggerText.textContent = filteredItem.title;
              this.selectedItem = { title: filteredItem.title, value: item.value };
            });
        }
      });
      this.customSelectTriggerText.classList.remove(CustomSelectSass.placeholder);
    }
    const customSelectTriggerArrow = this.customSelectTrigger.appendChild(
      document.createElement('div'),
    );
    customSelectTriggerArrow.className = CustomSelectSass.arrow;
    customSelectTriggerArrow.innerHTML = `
  <svg width="10" height="7" viewBox="0 0 10 7" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.47495 5.76064L0.849951 1.90426C0.799951 1.85106 0.762451 1.79344 0.737451 1.73138C0.712451 1.66933 0.699951 1.60284 0.699951 1.53191C0.699951 1.39007 0.745785 1.26596 0.837451 1.15957C0.929118 1.05319 1.04995 1 1.19995 1H8.79995C8.94995 1 9.07079 1.05319 9.16245 1.15957C9.25412 1.26596 9.29995 1.39007 9.29995 1.53191C9.29995 1.56738 9.24995 1.69149 9.14995 1.90426L5.52495 5.76064C5.44162 5.84929 5.35828 5.91135 5.27495 5.94681C5.19162 5.98227 5.09995 6 4.99995 6C4.89995 6 4.80828 5.98227 4.72495 5.94681C4.64162 5.91135 4.55828 5.84929 4.47495 5.76064Z" 
    fill="currentColor"/>
  </svg>
`;

    const customSelectOptions = customSelect.appendChild(document.createElement('div'));
    customSelectOptions.className = CustomSelectSass.customSelectOptions;

    window.onclick = (evt) => {
      if (evt.target.parentNode?.classList?.contains(CustomSelectSass['search-input'])) return;
      document.body
        .querySelectorAll(`.${CustomSelectSass.customSelect}`)
        .forEach((el) => el.classList.remove(CustomSelectSass.open));
      document.body
        .querySelectorAll(`.${CustomSelectSass.bodyCustomSelectWrapper}`)
        .forEach((el) => el.remove());
    };

    if (this.required && this._requiredText) {
      this.errMsg = this.container.appendChild(document.createElement('label'));
      this.errMsg.style.display = 'none';
      this.errMsg.style.color = '#BC000A';
      this.errMsg.style.paddingTop = '2px';
      this.errMsg.innerText = this._requiredText;
    }

    this.onInit = params.onInit;
    this.onInit?.();
  }

  public enable() {
    this.container.classList.remove(CustomSelectSass.disabled);
  }

  public disable() {
    this.container.classList.add(CustomSelectSass.disabled);
  }

  public close() {
    if (this.isOpen) {
      const wrapper = document.body.querySelector(`.${CustomSelectSass.bodyCustomSelectWrapper}`);
      if (wrapper) {
        wrapper.remove();
      }
      this.customSelectTrigger.parentElement?.classList.remove(CustomSelectSass.open);
      this.isOpen = false;
    }
  }

  private onWrapperClick(
    event: Event,
    container,
    customSelect: HTMLElement,
    customSelectTriggerText: HTMLElement,
    onSelect?: (item?: CustomSelectOption) => void,
  ) {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const wrapper = document.body.querySelector(`.${CustomSelectSass.bodyCustomSelectWrapper}`);
    this.isOpen = customSelect.classList.toggle(CustomSelectSass.open);
    if (wrapper) {
      wrapper.remove();
      document.body
        .querySelectorAll(`.${CustomSelectSass.customSelect}`)
        .forEach((el) => el.classList.remove(CustomSelectSass.open));
    }
    if (this.isOpen && target.classList.contains(CustomSelectSass.customSelectWrapper)) {
      customSelect.classList.add(CustomSelectSass.open);
      const wrapperRect = container.getBoundingClientRect();
      const bodyWrapper = document.createElement('div');
      bodyWrapper.className = CustomSelectSass.bodyCustomSelectWrapper;
      if (this.big) {
        bodyWrapper.classList.add(CustomSelectSass.big);
        bodyWrapper.style.marginTop = `${wrapperRect.height}px`;
      }
      bodyWrapper.style.top = `${wrapperRect.bottom}px`;
      bodyWrapper.style.left = `${wrapperRect.left}px`;
      bodyWrapper.style.width = `${wrapperRect.width}px`;
      bodyWrapper.style.zIndex = this.maxIndexZ().toString();

      if (this.searchOn) {
        this.searchInput = new CustomInput({
          root: bodyWrapper,
          labelText: 'Поиск',
          placeholder: 'Введите систему координат',
          required: false,
          className: CustomSelectSass['search-input'],
          listener: (evt) => {
            const value = evt.target.value;
            bodyOptions.innerHTML = '';
            if (value === '') {
              this.items.forEach((item) => {
                const selectOption = document.createElement('span');
                selectOption.className = CustomSelectSass.customSelectOption;
                selectOption.textContent = item.title;
                if (item.hint) {
                  selectOption.title = item.hint;
                }
                if (this.selectedItem && this.selectedItem.value === item.value) {
                  selectOption.classList.add(CustomSelectSass.selected);
                }
                selectOption.addEventListener('click', () => {
                  this.onOptionSelected(selectOption, customSelectTriggerText).then(() => {
                    this.selectedItem = item;
                    this.onWrapperClick(event, container, customSelect, customSelectTriggerText);
                    if (onSelect) onSelect({ ...item, target: event.target });
                    if (this.required && this._requiredText) {
                      this.errMsg.style.display = 'none';
                      this.customSelectTrigger.style = '';
                    }
                    customSelectTriggerText.classList.remove(CustomSelectSass.placeholder);
                  });
                });
                bodyOptions.appendChild(selectOption);
              });
            } else {
              this.items
                .filter((item) => item.title.toLowerCase().includes(value.toLowerCase()))
                .forEach((item) => {
                  const selectOption = document.createElement('span');
                  selectOption.className = CustomSelectSass.customSelectOption;
                  selectOption.textContent = item.title;
                  if (item.hint) {
                    selectOption.title = item.hint;
                  }
                  if (this.selectedItem && this.selectedItem.value === item.value) {
                    selectOption.classList.add(CustomSelectSass.selected);
                  }
                  selectOption.addEventListener('click', () =>
                    this.onOptionSelected(selectOption, customSelectTriggerText).then(() => {
                      this.selectedItem = item;
                      this.onWrapperClick(event, container, customSelect, customSelectTriggerText);
                      if (onSelect) onSelect({ ...item, target: event.target });
                      if (this.required && this._requiredText) {
                        this.errMsg.style.display = 'none';
                        this.customSelectTrigger.style = '';
                      }
                      customSelectTriggerText.classList.remove(CustomSelectSass.placeholder);
                    }),
                  );
                  bodyOptions.appendChild(selectOption);
                });
            }
          },
        });
      }

      const bodyOptions = bodyWrapper.appendChild(document.createElement('div'));
      bodyOptions.className = CustomSelectSass.bodyCustomSelectOptions;

      this.items.forEach((item) => {
        const selectOption = document.createElement('span');
        selectOption.className = CustomSelectSass.customSelectOption;
        selectOption.textContent = item.title;
        if (item.hint) {
          selectOption.title = item.hint;
        }
        if (this.selectedItem && this.selectedItem.value === item.value) {
          selectOption.classList.add(CustomSelectSass.selected);
        }
        selectOption.addEventListener('click', () =>
          this.onOptionSelected(selectOption, customSelectTriggerText).then(() => {
            this.selectedItem = item;
            this.onWrapperClick(event, container, customSelect, customSelectTriggerText);
            if (onSelect) onSelect({ ...item, target: event.target });
            if (this.required && this._requiredText) {
              this.errMsg.style.display = 'none';
              this.customSelectTrigger.style = '';
            }
            customSelectTriggerText.classList.remove(CustomSelectSass.placeholder);
          }),
        );
        bodyOptions.appendChild(selectOption);
      });

      document.body.appendChild(bodyWrapper);
      this.searchInput?.element.focus();

      if (this.items.length > this.showItemsCount) {
        let height = 2;
        try {
          let element = bodyOptions.firstElementChild;
          for (let i = 0; i <= this.showItemsCount - 1; i++) {
            height += element.clientHeight;
            element = element.nextElementSibling;
          }
        } catch (error) {
          height = 180;
        } finally {
          bodyOptions.style.maxHeight = `${height}px`;
          this.ps = new PerfectScrollbar(bodyOptions, {
            suppressScrollX: true,
            minScrollbarLength: 10,
          });
          this.ps.update();
        }
      }

      if (
        window.innerHeight - bodyWrapper.getBoundingClientRect().bottom <
        bodyWrapper.scrollHeight
      ) {
        //bodyWrapper.style.top = `${wrapperRect.top - bodyWrapper.scrollHeight - 1}px`;
        bodyWrapper.style.marginTop = `-${bodyWrapper.getBoundingClientRect().height + (this.big ? 40 : 0)}px`;
        bodyWrapper.classList.add(CustomSelectSass.dropUp);
      }
    }
  }

  private onOptionSelected(option: HTMLElement, view: HTMLElement): Promise<void> {
    return new Promise<void>((resolve) => {
      view.textContent = option.textContent;
      if (!option.classList.contains(CustomSelectSass.selected)) {
        option.parentNode
          .querySelector(`.${CustomSelectSass.customSelectOption}.${CustomSelectSass.selected}`)
          ?.classList.remove(CustomSelectSass.selected);
        option.classList.add(CustomSelectSass.selected);
        resolve();
      }
    });
  }

  private maxIndexZ = () =>
    Array.from(document.querySelectorAll('body *'))
      .map((el: Element) => parseFloat(getComputedStyle(el).zIndex))
      .reduce((highest: number, z: number) => (z > highest ? z : highest), 1);
}

export default CustomSelect;
export type { CustomSelectOption };
