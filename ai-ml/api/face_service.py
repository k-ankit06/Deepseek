"""
Face Recognition Service - Lightweight Version
Uses MediaPipe for face detection + InsightFace ONNX for embeddings
Optimized for low-memory environments (Render Free Tier)
"""

import cv2
import numpy as np
import base64
from typing import Tuple, List, Optional, Dict

# Use MediaPipe for lightweight face detection
import mediapipe as mp

# Try to use insightface for embeddings, fall back to simpler approach
try:
    from insightface.app import FaceAnalysis
    HAS_INSIGHTFACE = True
except ImportError:
    HAS_INSIGHTFACE = False
    print("[FaceService] InsightFace not available, using MediaPipe-only mode")


class FaceRecognitionService:
    """
    Lightweight Face Recognition Service for Attendance System
    
    Uses:
    - MediaPipe Face Detection (fast, low memory ~50MB)
    - MediaPipe Face Mesh for landmark validation
    - InsightFace ONNX for 512-D embeddings (if available)
    - Cosine similarity for face matching
    
    Memory footprint: ~200MB (vs ~1.5GB with PyTorch/FaceNet)
    """
    
    # Thresholds
    MIN_CONFIDENCE = 0.85       # Detection confidence
    SIMILARITY_THRESHOLD = 0.4  # Cosine similarity threshold for InsightFace
    MIN_FACE_SIZE = 60          # Minimum face size in pixels
    
    def __init__(self):
        """Initialize lightweight face detection models"""
        print("[FaceService] Initializing lightweight models...")
        
        # MediaPipe Face Detection
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_face_mesh = mp.solutions.face_mesh
        
        self.face_detector = self.mp_face_detection.FaceDetection(
            model_selection=1,  # 1 = full range model (better for varied distances)
            min_detection_confidence=0.7
        )
        
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=5,
            refine_landmarks=True,
            min_detection_confidence=0.7
        )
        
        # InsightFace for embeddings (if available)
        self.face_analyzer = None
        if HAS_INSIGHTFACE:
            try:
                self.face_analyzer = FaceAnalysis(
                    name='buffalo_s',  # Small model, ~30MB
                    providers=['CPUExecutionProvider'],
                    allowed_modules=['detection', 'recognition']
                )
                self.face_analyzer.prepare(ctx_id=-1, det_size=(320, 320))
                print("[FaceService] InsightFace loaded (buffalo_s model)")
            except Exception as e:
                print(f"[FaceService] InsightFace init failed: {e}, using MediaPipe-only")
                self.face_analyzer = None
        
        print("[FaceService] Models loaded successfully")
    
    @staticmethod
    def decode_base64_image(base64_string: str) -> Optional[np.ndarray]:
        """Decode base64 string to OpenCV image"""
        try:
            if 'base64,' in base64_string:
                base64_string = base64_string.split('base64,')[1]
            
            image_bytes = base64.b64decode(base64_string)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return image
        except Exception as e:
            print(f"[FaceService] Error decoding image: {e}")
            return None
    
    def detect_faces(self, image: np.ndarray) -> Tuple[List[Dict], str]:
        """
        Detect faces using MediaPipe
        
        Returns:
            (face_data_list, error_message)
        """
        if image is None:
            return [], "Invalid image"
        
        h, w, _ = image.shape
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Use MediaPipe face detection
        results = self.face_detector.process(rgb_image)
        
        if not results.detections:
            return [], "No face detected - please position your face in the camera"
        
        high_confidence_faces = []
        for detection in results.detections:
            confidence = detection.score[0]
            
            if confidence >= self.MIN_CONFIDENCE:
                # Get bounding box
                bbox = detection.location_data.relative_bounding_box
                x1 = int(bbox.xmin * w)
                y1 = int(bbox.ymin * h)
                x2 = int((bbox.xmin + bbox.width) * w)
                y2 = int((bbox.ymin + bbox.height) * h)
                
                # Clamp to image bounds
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)
                
                face_width = x2 - x1
                face_height = y2 - y1
                
                if face_width >= self.MIN_FACE_SIZE and face_height >= self.MIN_FACE_SIZE:
                    # Extract keypoints
                    keypoints = {}
                    for kp_id, keypoint in enumerate(detection.location_data.relative_keypoints):
                        keypoints[kp_id] = [keypoint.x * w, keypoint.y * h]
                    
                    high_confidence_faces.append({
                        'box': [x1, y1, x2, y2],
                        'confidence': float(confidence),
                        'keypoints': keypoints,
                        'landmarks': self._get_landmarks_from_keypoints(keypoints)
                    })
        
        if len(high_confidence_faces) == 0:
            return [], f"Face detected but confidence too low (min {self.MIN_CONFIDENCE * 100}% required) - ensure good lighting"
        
        if len(high_confidence_faces) > 1:
            return [], f"Multiple faces detected ({len(high_confidence_faces)}) - only one person allowed"
        
        return high_confidence_faces, ""
    
    def _get_landmarks_from_keypoints(self, keypoints: Dict) -> List[List[float]]:
        """Convert MediaPipe keypoints to landmark format"""
        # MediaPipe keypoints: 0=right_eye, 1=left_eye, 2=nose_tip, 3=mouth_center, 4=right_ear, 5=left_ear
        landmarks = []
        for i in range(min(6, len(keypoints))):
            if i in keypoints:
                landmarks.append(keypoints[i])
            else:
                landmarks.append([0, 0])
        return landmarks
    
    def is_human_face(self, image: np.ndarray, face_data: Dict) -> Tuple[bool, str]:
        """
        Validate if detected face is a human face using MediaPipe Face Mesh
        """
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Use face mesh for detailed validation
            mesh_results = self.face_mesh.process(rgb_image)
            
            if not mesh_results.multi_face_landmarks:
                return False, "Human face required - no facial features detected"
            
            face_landmarks = mesh_results.multi_face_landmarks[0]
            
            # Get key landmark positions
            h, w, _ = image.shape
            
            # Landmark indices for key facial features:
            # 33 = left eye outer, 263 = right eye outer
            # 1 = nose tip, 13 = upper lip, 14 = lower lip
            left_eye = face_landmarks.landmark[33]
            right_eye = face_landmarks.landmark[263]
            nose = face_landmarks.landmark[1]
            upper_lip = face_landmarks.landmark[13]
            
            # Check eyes are above nose
            if left_eye.y > nose.y or right_eye.y > nose.y:
                return False, "Invalid face orientation - please face the camera directly"
            
            # Check nose is above mouth
            if nose.y > upper_lip.y:
                return False, "Invalid face orientation - please face the camera directly"
            
            # Check eyes are roughly at same height
            eye_diff = abs(left_eye.y - right_eye.y) * h
            if eye_diff > 30:
                return False, "Face tilted too much - please straighten your head"
            
            return True, ""
            
        except Exception as e:
            print(f"[FaceService] Face mesh validation error: {e}")
            # If mesh validation fails, still allow based on detection confidence
            if face_data.get('confidence', 0) >= 0.90:
                return True, ""
            return False, "Face validation failed - please try again"
    
    def generate_face_encoding(self, image: np.ndarray, face_data: Dict) -> Optional[List[float]]:
        """
        Generate face embedding
        Uses InsightFace if available, otherwise creates a feature vector from face mesh
        """
        try:
            if self.face_analyzer:
                return self._generate_insightface_encoding(image, face_data)
            else:
                return self._generate_mesh_encoding(image, face_data)
        except Exception as e:
            print(f"[FaceService] Encoding error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _generate_insightface_encoding(self, image: np.ndarray, face_data: Dict) -> Optional[List[float]]:
        """Generate 512-D embedding using InsightFace"""
        try:
            faces = self.face_analyzer.get(image)
            
            if not faces:
                print("[FaceService] InsightFace: No face found for encoding")
                return None
            
            # Get the embedding from the first detected face
            embedding = faces[0].embedding
            
            # Normalize the embedding
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            
            embedding_list = embedding.tolist()
            print(f"[FaceService] Generated InsightFace embedding: {len(embedding_list)}-D")
            return embedding_list
            
        except Exception as e:
            print(f"[FaceService] InsightFace encoding error: {e}")
            # Fall back to mesh encoding
            return self._generate_mesh_encoding(image, face_data)
    
    def _generate_mesh_encoding(self, image: np.ndarray, face_data: Dict) -> Optional[List[float]]:
        """
        Generate face encoding using MediaPipe Face Mesh landmarks
        Creates a 468*3 = 1404-D feature vector from normalized landmarks,
        then reduces to 512-D using PCA-like projection
        """
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            mesh_results = self.face_mesh.process(rgb_image)
            
            if not mesh_results.multi_face_landmarks:
                return None
            
            landmarks = mesh_results.multi_face_landmarks[0]
            h, w, _ = image.shape
            
            # Extract all 468 landmarks as normalized coordinates
            points = []
            for lm in landmarks.landmark:
                points.extend([lm.x, lm.y, lm.z])
            
            # Convert to numpy array
            feature_vector = np.array(points, dtype=np.float32)
            
            # Normalize relative to face bounding box
            box = face_data['box']
            face_w = box[2] - box[0]
            face_h = box[3] - box[1]
            
            if face_w > 0 and face_h > 0:
                # Normalize x coordinates
                feature_vector[0::3] = (feature_vector[0::3] * w - box[0]) / face_w
                # Normalize y coordinates  
                feature_vector[1::3] = (feature_vector[1::3] * h - box[1]) / face_h
                # Z coordinates are already normalized by MediaPipe
            
            # Reduce to 512-D using deterministic projection
            np.random.seed(42)  # Fixed seed for consistent projection
            projection_matrix = np.random.randn(len(feature_vector), 512).astype(np.float32)
            projection_matrix = projection_matrix / np.linalg.norm(projection_matrix, axis=0, keepdims=True)
            
            embedding = feature_vector @ projection_matrix
            
            # L2 normalize
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            
            embedding_list = embedding.tolist()
            print(f"[FaceService] Generated mesh-based embedding: {len(embedding_list)}-D")
            return embedding_list
            
        except Exception as e:
            print(f"[FaceService] Mesh encoding error: {e}")
            return None
    
    @staticmethod
    def cosine_similarity(embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    
    def match_face_encoding(self, known_encoding: List[float], unknown_encoding: List[float]) -> Tuple[float, bool]:
        """
        Match face encoding using cosine similarity
        
        Returns:
            (confidence_percentage, is_match)
        """
        try:
            similarity = self.cosine_similarity(known_encoding, unknown_encoding)
            
            # Map from [-1, 1] to [0, 100]
            confidence = ((similarity + 1) / 2) * 100
            
            is_match = similarity >= self.SIMILARITY_THRESHOLD
            
            return round(confidence, 2), is_match
            
        except Exception as e:
            print(f"[FaceService] Matching error: {e}")
            return 0.0, False
    
    def process_registration_image(self, base64_image: str) -> Dict:
        """Process image for student registration"""
        result = {
            'success': False,
            'encoding': None,
            'error': None
        }
        
        image = self.decode_base64_image(base64_image)
        if image is None:
            result['error'] = "Invalid image format"
            return result
        
        face_data_list, error = self.detect_faces(image)
        if error:
            result['error'] = error
            return result
        
        face_data = face_data_list[0]
        
        is_human, error = self.is_human_face(image, face_data)
        if not is_human:
            result['error'] = error
            return result
        
        encoding = self.generate_face_encoding(image, face_data)
        if encoding is None:
            result['error'] = "Failed to generate face encoding"
            return result
        
        result['success'] = True
        result['encoding'] = encoding
        
        return result
    
    def process_attendance_image(self, base64_image: str, student_encodings: Dict[str, Dict]) -> Dict:
        """Process image for attendance marking"""
        result = {
            'success': False,
            'recognized': [],
            'errors': []
        }
        
        image = self.decode_base64_image(base64_image)
        if image is None:
            result['errors'].append("Invalid image format")
            return result
        
        face_data_list, error = self.detect_faces(image)
        if error:
            result['errors'].append(error)
            return result
        
        face_data = face_data_list[0]
        
        is_human, error = self.is_human_face(image, face_data)
        if not is_human:
            result['errors'].append(error)
            return result
        
        captured_encoding = self.generate_face_encoding(image, face_data)
        if captured_encoding is None:
            result['errors'].append("Failed to generate face encoding")
            return result
        
        print(f"[Recognition] Comparing with {len(student_encodings)} stored encodings...")
        
        best_match = None
        best_confidence = 0.0
        
        for student_id, student_data in student_encodings.items():
            stored_encoding = student_data.get('encoding')
            if not stored_encoding:
                continue
            
            confidence, is_match = self.match_face_encoding(stored_encoding, captured_encoding)
            
            print(f"[Recognition] Student {student_id}: confidence={confidence:.2f}%, match={is_match}")
            
            if is_match and confidence > best_confidence:
                best_confidence = confidence
                best_match = {
                    'studentId': student_id,
                    'confidence': confidence,
                    'name': student_data.get('name', 'Unknown'),
                    'rollNumber': student_data.get('rollNumber', '')
                }
        
        if best_match:
            result['success'] = True
            result['recognized'].append(best_match)
            print(f"[Recognition] ✅ Match found: {best_match['name']} ({best_match['confidence']:.2f}%)")
        else:
            result['errors'].append("No matching student found - face not registered or confidence too low")
            print(f"[Recognition] ❌ No match found. Best confidence was {best_confidence:.2f}%")
        
        return result
