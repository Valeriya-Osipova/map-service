import { CustomButton } from '../CustomButton/CustomButton';
import { AuthPage } from './authPage/authPage';

export function createAuthButtons(container: HTMLElement) {
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'button-container';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '30px';

  new CustomButton({
    root: buttonContainer,
    text: 'Войти',
    variant: 'default',
    clickHandler: () => {
      history.pushState(null, '', '/login');
      renderAuthPage();
      // window.location.href = '/login';
    },
  });

  new CustomButton({
    root: buttonContainer,
    text: 'Зарегистрироваться',
    variant: 'default',
    clickHandler: () => {
      history.pushState(null, '', '/register');
      renderAuthPage();
      // window.location.href = '/register';
    },
  });

  container.appendChild(buttonContainer);

  return buttonContainer;
}

export function renderAuthPage() {
  const path = window.location.pathname;
  const mapContainer = document.getElementById('map-container');
  const footer = document.getElementById('footer');
  const authContainer = document.getElementById('auth');
  const buttonsContainer = document.getElementById('button-container');

  if (path === '/login' || path === '/register') {
    if (mapContainer) mapContainer.style.display = 'none';
    if (buttonsContainer) buttonsContainer.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (authContainer) authContainer.style.display = 'block';

    if (path === '/login') {
      new AuthPage({ mode: 'login', container: document.body, onSubmit: () => {} });
    } else {
      new AuthPage({ mode: 'register', container: document.body, onSubmit: () => {} });
    }
  } else {
    window.location.reload();
  }
}
