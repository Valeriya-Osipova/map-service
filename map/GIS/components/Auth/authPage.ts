import { CustomButton } from '../CustomButton/CustomButton';
import { CustomInput } from '../CustomInput/CustomInput';
import authPageStyles from './auth-page.module.scss';

export type AuthMode = 'login' | 'register';

export interface AuthPageOptions {
  mode: AuthMode;
  onSubmit: (data: { name?: string; email: string; password: string }) => void;
  container: HTMLElement;
}

export class AuthPage {
  private mode: AuthMode;
  private onSubmit: (data: { name?: string; email: string; password: string }) => void;
  private container: HTMLElement;
  private form: HTMLFormElement;
  private nameInput?: HTMLInputElement;
  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;

  constructor(options: AuthPageOptions) {
    this.mode = options.mode;
    this.onSubmit = options.onSubmit;
    this.container = options.container;
    this.form = document.createElement('form');
    this.form.addEventListener('submit', this.handleSubmit);

    this.render();
  }

  private render() {
    this.form.innerHTML = '';
    this.hideMap();

    const authPopup = this.container.appendChild(document.createElement('div'));
    authPopup.className = authPageStyles.authPopup;

    const inputName = new CustomInput({
      root: authPopup,
      labelText: 'Имя',
    });

    const lastName = new CustomInput({
      root: authPopup,
      labelText: 'Фамилия',
    });

    const login = new CustomInput({
      root: authPopup,
      labelText: 'Логин',
    });

    const password = new CustomInput({
      root: authPopup,
      labelText: 'Пароль',
      type: 'password',
    });

    const passwordRepeat = new CustomInput({
      root: authPopup,
      labelText: 'Подтверждение пароля',
      type: 'password',
    });

    new CustomButton({
      root: authPopup,
      text: 'Зарегистрироваться',
      clickHandler() {
        console.log('register');
      },
    });
  }

  private hideMap() {
    const body = document.getElementById('map-container');
    const footer = document.getElementById('footer');
    if (!body || !footer) {
      console.error('Map container not found');
      return;
    }
    body.style.display = 'none';
    footer.style.display = 'none';
  }

  private handleSubmit = (e: Event) => {
    e.preventDefault();
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    if (this.mode === 'register' && this.nameInput) {
      const name = this.nameInput.value;
      this.onSubmit({ name, email, password });
    } else {
      this.onSubmit({ email, password });
    }
  };
}
