import { CustomButton } from '../CustomButton/CustomButton';
import { CustomInput } from '../CustomInput/CustomInput';
import authPageStyles from './auth-page.module.scss';

export type AuthMode = 'login' | 'register';

export interface RegisterData {
  name: string;
  lastName: string;
  login: string;
  password: string;
}

export interface LoginData {
  login: string;
  password: string;
}

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
  private registerData: RegisterData | null;
  private loginData: LoginData | null;

  constructor(options: AuthPageOptions) {
    this.mode = options.mode;
    this.onSubmit = options.onSubmit;
    this.container = options.container;
    this.form = document.createElement('form');
    this.form.addEventListener('submit', this.handleSubmit);

    this.registerData = null;
    this.loginData = null;

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
      required: true,
      onChange() {
        inputName.requiredErr = false;
      },
    });

    const lastName = new CustomInput({
      root: authPopup,
      labelText: 'Фамилия',
      required: true,
      onChange() {
        lastName.requiredErr = false;
      },
    });

    const login = new CustomInput({
      root: authPopup,
      labelText: 'Логин (email)',
      required: true,
      onChange() {
        login.requiredErr = false;
      },
    });

    const password = new CustomInput({
      root: authPopup,
      labelText: 'Пароль',
      type: 'password',
      required: true,
      onChange() {
        password.requiredErr = false;
      },
    });

    const passwordRepeat = new CustomInput({
      root: authPopup,
      labelText: 'Подтверждение пароля',
      type: 'password',
      required: true,
      onChange() {
        passwordRepeat.requiredErr = false;
      },
    });

    const errorMessage = authPopup.appendChild(document.createElement('div'));
    errorMessage.style.display = 'none';
    errorMessage.style.color = '#BC000A';
    errorMessage.style.fontSize = '14px';

    const buttonContainer = authPopup.appendChild(document.createElement('div'));
    buttonContainer.className = authPageStyles.buttonContainer;

    new CustomButton({
      root: buttonContainer,
      text: 'Зарегистрироваться',
      clickHandler() {
        errorMessage.style.display = 'none';
        [inputName, lastName, login, password, passwordRepeat].forEach((input) => {
          input.requiredErr = false;
        });
        const emptyFields = [];
        if (!inputName.value?.trim()) emptyFields.push(inputName);
        if (!lastName.value?.trim()) emptyFields.push(lastName);
        if (!login.value?.trim()) emptyFields.push(login);
        if (!password.value?.trim()) emptyFields.push(password);
        if (!passwordRepeat.value?.trim()) emptyFields.push(passwordRepeat);

        console.log(emptyFields);

        if (emptyFields.length > 0) {
          emptyFields.forEach((input) => {
            input.requiredErr = true;
          });
          errorMessage.style.display = 'block';
          errorMessage.textContent = 'Необходимо заполнить все поля';
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(login.value as string)) {
          login.requiredErr = true;
          errorMessage.style.display = 'block';
          errorMessage.textContent = 'Логин должен быть валидным email';
          return;
        }

        if (password.value !== passwordRepeat.value) {
          password.requiredErr = true;
          passwordRepeat.requiredErr = true;
          errorMessage.style.display = 'block';
          errorMessage.textContent = 'Пароли не совпадают';
          return;
        }
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        this.registerData = {
          name: inputName.value,
          lastName: lastName.value,
          login: login.value,
          password: password.value,
        };

        console.log('Регистрация успешна :', this.registerData);
      },
    });
  }

  private renderLogin(authPopup: HTMLElement) {
    const login = new CustomInput({
      root: authPopup,
      labelText: 'Логин (email)',
      required: true,
      onChange() {
        login.requiredErr = false;
      },
    });

    const password = new CustomInput({
      root: authPopup,
      labelText: 'Пароль',
      type: 'password',
      required: true,
      onChange() {
        password.requiredErr = false;
      },
    });
    const errorMessage = authPopup.appendChild(document.createElement('div'));
    errorMessage.style.display = 'none';
    errorMessage.style.color = '#BC000A';
    errorMessage.style.fontSize = '14px';

    const buttonContainer = authPopup.appendChild(document.createElement('div'));
    buttonContainer.className = authPageStyles.buttonContainer;
    new CustomButton({
      root: buttonContainer,
      text: 'Войти',
      clickHandler() {
        errorMessage.style.display = 'none';
        login.requiredErr = false;
        password.requiredErr = false;

        if (!login.value.length || !password.value.length) {
          errorMessage.style.display = 'block';
          errorMessage.textContent = 'Необходимо заполнить все поля';
          if (!login.value.length) login.requiredErr = true;
          if (!password.value.length) password.requiredErr = true;
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(login.value as string)) {
          login.requiredErr = true;
          errorMessage.style.display = 'block';
          errorMessage.textContent = 'Логин должен быть валидным email';
          return;
        }

        this.loginData = {
          login: login.value,
          password: password.value,
        };

        console.log('Авторизация успешна :', this.loginData);
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
