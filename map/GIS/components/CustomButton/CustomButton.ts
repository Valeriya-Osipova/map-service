import styles from './custom-button.module.scss';

interface CustomButtonProps {
  root: HTMLElement;
  clickHandler: () => void;
  text?: string;
  icon?: HTMLElement;
  variant?: 'default' | 'white' | 'icon';
  disabled?: boolean;
  tooltip?: string;
  className?: string;
}

export class CustomButton {
  readonly button: HTMLButtonElement;
  private root: HTMLElement;

  constructor({
    root,
    text,
    icon,
    clickHandler,
    variant,
    disabled = false,
    tooltip,
    className,
  }: CustomButtonProps) {
    this.root = root;
    variant = variant ? variant : 'default';
    this.button = document.createElement('button');
    this.button.disabled = disabled;

    if (text) {
      const textSpan = document.createElement('span');
      textSpan.className = styles.root__text;
      textSpan.textContent = text;
      this.button.appendChild(textSpan);
    }

    if (icon) {
      icon.className = `${icon.className || ''} ${styles.root__icon}`.trim();
      this.button.appendChild(icon);
    }

    tooltip && (this.button.title = tooltip);

    this.button.className = [styles.root, styles[`root--${variant}`], className]
      .filter(Boolean)
      .join(' ');

    this.button.addEventListener('click', clickHandler.bind(this));
    this.root.appendChild(this.button);
  }

  set disabled(disabled: boolean) {
    this.button.disabled = disabled;
  }
}
