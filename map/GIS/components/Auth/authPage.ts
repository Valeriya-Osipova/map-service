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

  render() {
    this.form.innerHTML = '';
    const isAuthPage =
      window.location.pathname === '/login' || window.location.pathname === '/register';

    const mapHeader = document.getElementById('auth');
    if (mapHeader) {
      if (isAuthPage) {
        new CustomButton({
          root: mapHeader,
          text: 'Назад',
          variant: 'default',
          clickHandler: () => (window.location.href = '/'),
        });
      }
    }

    const header = this.container.appendChild(document.createElement('div'));
    header.innerText = this.mode === 'login' ? 'Авторизация' : 'Регистрация';
    header.className = authPageStyles.header;

    const authPopup = this.container.appendChild(document.createElement('div'));
    authPopup.className = authPageStyles.authPopup;

    if (this.mode === 'login') {
      this.renderLogin(authPopup);
    } else if (this.mode === 'register') {
      this.renderRegistration(authPopup);
    } else {
      console.log('unknown mode');
      return;
    }
  }

  private renderRegistration(authPopup: HTMLElement) {
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

    const buttonContainer = authPopup.appendChild(document.createElement('div'));
    buttonContainer.className = authPageStyles.buttonContainer;

    new CustomButton({
      root: buttonContainer,
      text: 'Зарегистрироваться',
      clickHandler() {
        console.log('register');
      },
    });
  }

  private renderLogin(authPopup: HTMLElement) {
    const login = new CustomInput({
      root: authPopup,
      labelText: 'Логин',
    });

    const password = new CustomInput({
      root: authPopup,
      labelText: 'Пароль',
      type: 'password',
    });

    const buttonContainer = authPopup.appendChild(document.createElement('div'));
    buttonContainer.className = authPageStyles.buttonContainer;
    new CustomButton({
      root: buttonContainer,
      text: 'Войти',
      clickHandler() {
        console.log('login');
      },
    });
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
