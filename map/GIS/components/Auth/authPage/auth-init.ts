import { AuthPage } from './authPage';

const path = window.location.pathname;
const authContainer = document.getElementById('auth');

if (authContainer) {
  if (path === '/login') {
    new AuthPage({
      mode: 'login',
      container: document.body,
      onSubmit: (data) => {
        console.log('Login data:', data);
        // Здесь обработка входа и редирект
        // window.location.href = '/'; // Раскомментируйте для редиректа после успешного входа
      },
    });
  } else if (path === '/register') {
    new AuthPage({
      mode: 'register',
      container: document.body,
      onSubmit: (data) => {
        console.log('Register data:', data);
        // Здесь обработка регистрации и редирект
        // window.location.href = '/'; // Раскомментируйте для редиректа после успешной регистрации
      },
    });
  }
}
