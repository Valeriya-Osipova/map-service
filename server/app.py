from flask import Flask, jsonify # type: ignore

app = Flask(__name__)

@app.route('/example')
def example():
  return jsonify(message='Hello from Flask!')

if __name__ == '__main__':
  app.run(debug=True)