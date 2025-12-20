# AI Service API Routes
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from face_recognition.recognizer import FaceRecognitionService

app = Flask(__name__)
CORS(app)

# Initialize face recognition service
face_service = FaceRecognitionService()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'AI Face Recognition'})

@app.route('/api/register-face', methods=['POST'])
def register_face():
    """
    Register student face
    Expected: {image: base64_string}
    Returns: {success, encoding, error}
    """
    try:
        data = request.get_json()
        image = data.get('image')
        
        if not image:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        result = face_service.process_student_registration(image)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/recognize', methods=['POST'])
def recognize():
    """
    Recognize faces in attendance image
    Expected: {image: base64_string, students: {id: encoding}}
    Returns: {success, recognized: [{studentId, confidence}]}
    """
    try:
        data = request.get_json()
        image = data.get('image')
        students = data.get('students', {})
        
        if not image:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        if not students:
            return jsonify({'success': False, 'error': 'No student encodings provided'}), 400
        
        result = face_service.process_attendance_image(image, students)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/detect', methods=['POST'])
def detect():
    """
    Just detect faces without recognition
    Expected: {image: base64_string}
    Returns: {success, faces: count}
    """
    try:
        data = request.get_json()
        image = data.get('image')
        
        if not image:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        image_array = face_service.decode_base64_image(image)
        if image_array is None:
            return jsonify({'success': False, 'error': 'Invalid image'}), 400
        
        face_locations = face_service.detect_faces(image_array)
        
        return jsonify({
            'success': True,
            'faces': len(face_locations),
            'locations': face_locations
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("AI Face Recognition Service Starting...")
    print("=" * 50)
    app.run(host='0.0.0.0', port=8000, debug=True)
