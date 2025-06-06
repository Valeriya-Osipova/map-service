from flask import Flask, request, jsonify
from typing import Dict, Any

app = Flask(__name__)

@app.route('/example')
def example():
  return jsonify(message='Hello from Flask!')

@app.route('/register', methods=['POST'])
def register():
    # Получаем данные из запроса
    data: Dict[str, Any] = request.get_json()
    
    # Проверяем обязательные поля (просто для примера, в реальном приложении нужна валидация)
    required_fields = ['name', 'lastName', 'login', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # В реальном приложении здесь была бы обработка регистрации
    # (хеширование пароля, сохранение в БД и т.д.)
    
    # Возвращаем те же данные + статус успешной регистрации
    response_data = {
        'status': 'success',
        'user': {
            'name': data['name'],
            'lastName': data['lastName'],
            'login': data['login']
        }
    }
    return jsonify(response_data), 200

@app.route('/login', methods=['POST'])
def login():
    # Получаем данные из запроса
    data: Dict[str, Any] = request.get_json()
    
    # Проверяем обязательные поля
    required_fields = ['login', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # В реальном приложении здесь была бы проверка учетных данных
    # (поиск пользователя, проверка пароля и т.д.)
    
    # Возвращаем те же данные + токен (в реальном приложении)
    response_data = {
        'status': 'success',
        'user': {
            'login': data['login']
        },
        'token': 'dummy_token_for_example'
    }
    return jsonify(response_data), 200

@app.route('/emailConfirm', methods=['POST'])
def email_confirm():
    
    data: Dict[str, Any] = request.get_json()

    required_fields = ['code']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    response_data = {
        'status': 'success',
        'code': data['code'],
    }
    return jsonify(response_data), 200

if __name__ == '__main__':
  app.run(debug=True)