import { CustomButton } from '../CustomButton/CustomButton';

export function createAuthButtons(container: HTMLElement) {
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '30px';

  new CustomButton({
    root: buttonContainer,
    text: 'Войти',
    variant: 'default',
    clickHandler: () => {
      window.location.href = '/login';
    },
  });

  new CustomButton({
    root: buttonContainer,
    text: 'Зарегистрироваться',
    variant: 'default',
    clickHandler: () => {
      window.location.href = '/register';
    },
  });

  container.appendChild(buttonContainer);

  return buttonContainer;
}
