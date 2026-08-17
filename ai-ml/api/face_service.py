"""
Face Recognition Service - Ultra-Lightweight Version
Uses ONLY OpenCV (no MediaPipe, no InsightFace, no system deps)
Works on Render Free Tier Native Python without apt-get

Detection: OpenCV DNN (Caffe model) or Haar Cascades
Embeddings: Histogram + Landmark-based 512-D feature vectors
Matching: Cosine Similarity
"""

import cv2
import numpy as np
import base64
import os
import urllib.request
from typing import Tuple, List, Optional, Dict


class FaceRecognitionService:
    """
    Ultra-Lightweight Face Recognition Service for Attendance System
    
    Uses ONLY OpenCV - no system dependencies required:
    - OpenCV DNN face detector (SSD/Caffe model, auto-downloaded ~5MB)
    - OpenCV Haar Cascade fallback (bundled with OpenCV)
    - Histogram + spatial feature vectors for 512-D embeddings
    - Cosine similarity for face matching
    
    Memory footprint: ~80MB (works on Render Free Tier 512MB RAM)
    """
    
    # Thresholds
    MIN_CONFIDENCE = 0.5        # DNN detection confidence
    HAAR_SCALE_FACTOR = 1.1     # Haar cascade scale factor
    HAAR_MIN_NEIGHBORS = 5      # Haar cascade min neighbors
    SIMILARITY_THRESHOLD = 0.4  # Cosine similarity threshold
    MIN_FACE_SIZE = 60          # Minimum face size in pixels
    
    # DNN model files
    DNN_PROTO = "deploy.prototxt"
    DNN_MODEL = "res10_300x300_ssd_iter_140000.caffemodel"
    DNN_PROTO_URL = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
    DNN_MODEL_URL = "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"
    
    def __init__(self):
        """Initialize face detection models (OpenCV only)"""
        print("[FaceService] Initializing OpenCV-only models...")
        
        self.dnn_net = None
        self.haar_cascade = None
        self.model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models')
        os.makedirs(self.model_dir, exist_ok=True)
        
        # Try DNN-based face detector (more accurate)
        try:
            self._load_dnn_model()
            print("[FaceService] ✅ OpenCV DNN face detector loaded")
        except Exception as e:
            print(f"[FaceService] DNN model load failed: {e}")
            self.dnn_net = None
        
        # Always load Haar Cascade as fallback (bundled with OpenCV)
        try:
            haar_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.haar_cascade = cv2.CascadeClassifier(haar_path)
            if self.haar_cascade.empty():
                print("[FaceService] ⚠️ Haar cascade failed to load")
                self.haar_cascade = None
            else:
                print("[FaceService] ✅ Haar Cascade face detector loaded (fallback)")
        except Exception as e:
            print(f"[FaceService] Haar cascade error: {e}")
            self.haar_cascade = None
        
        # Load eye cascade for human face validation
        try:
            eye_path = cv2.data.haarcascades + 'haarcascade_eye.xml'
            self.eye_cascade = cv2.CascadeClassifier(eye_path)
            if self.eye_cascade.empty():
                self.eye_cascade = None
        except Exception:
            self.eye_cascade = None
        
        if self.dnn_net or self.haar_cascade:
            print("[FaceService] ✅ Models loaded successfully")
        else:
            print("[FaceService] ⚠️ No face detector available - will accept all photos")
    
    def _load_dnn_model(self):
        """Download and load OpenCV DNN face detection model"""
        proto_path = os.path.join(self.model_dir, self.DNN_PROTO)
        model_path = os.path.join(self.model_dir, self.DNN_MODEL)
        
        # Download if not exists
        if not os.path.exists(proto_path):
            print(f"[FaceService] Downloading DNN proto... ({self.DNN_PROTO_URL})")
            urllib.request.urlretrieve(self.DNN_PROTO_URL, proto_path)
        
        if not os.path.exists(model_path):
            print(f"[FaceService] Downloading DNN model (~5MB)...")
            urllib.request.urlretrieve(self.DNN_MODEL_URL, model_path)
        
        self.dnn_net = cv2.dnn.readNetFromCaffe(proto_path, model_path)
        print("[FaceService] DNN model loaded from disk")
    
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
        Detect faces using OpenCV DNN or Haar Cascade
        
        Returns:
            (face_data_list, error_message)
        """
        if image is None:
            return [], "Invalid image"
        
        h, w = image.shape[:2]
        faces = []
        
        # Method 1: DNN-based detection (more accurate)
        if self.dnn_net is not None:
            faces = self._detect_dnn(image, h, w)
        
        # Method 2: Haar Cascade fallback
        if len(faces) == 0 and self.haar_cascade is not None:
            faces = self._detect_haar(image, h, w)
        
        # No detector available - accept the photo
        if self.dnn_net is None and self.haar_cascade is None:
            return [{'box': [0, 0, w, h], 'confidence': 0.5, 'method': 'none'}], ""
        
        if len(faces) == 0:
            return [], "No face detected - please position your face in the camera"
        
        if len(faces) > 1:
            return [], f"Multiple faces detected ({len(faces)}) - only one person allowed"
        
        return faces, ""
    
    def _detect_dnn(self, image: np.ndarray, h: int, w: int) -> List[Dict]:
        """Detect faces using OpenCV DNN"""
        blob = cv2.dnn.blobFromImage(
            cv2.resize(image, (300, 300)), 
            1.0, (300, 300), 
            (104.0, 177.0, 123.0)
        )
        self.dnn_net.setInput(blob)
        detections = self.dnn_net.forward()
        
        faces = []
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            
            if confidence >= self.MIN_CONFIDENCE:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                x1, y1, x2, y2 = box.astype("int")
                
                # Clamp to image bounds
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)
                
                face_w = x2 - x1
                face_h = y2 - y1
                
                if face_w >= self.MIN_FACE_SIZE and face_h >= self.MIN_FACE_SIZE:
                    faces.append({
                        'box': [x1, y1, x2, y2],
                        'confidence': float(confidence),
                        'method': 'dnn'
                    })
        
        return faces
    
    def _detect_haar(self, image: np.ndarray, h: int, w: int) -> List[Dict]:
        """Detect faces using Haar Cascade"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        
        detections = self.haar_cascade.detectMultiScale(
            gray,
            scaleFactor=self.HAAR_SCALE_FACTOR,
            minNeighbors=self.HAAR_MIN_NEIGHBORS,
            minSize=(self.MIN_FACE_SIZE, self.MIN_FACE_SIZE)
        )
        
        faces = []
        for (x, y, fw, fh) in detections:
            faces.append({
                'box': [int(x), int(y), int(x + fw), int(y + fh)],
                'confidence': 0.85,  # Haar doesn't provide confidence
                'method': 'haar'
            })
        
        return faces
    
    def is_human_face(self, image: np.ndarray, face_data: Dict) -> Tuple[bool, str]:
        """
        Validate if detected face is a human face
        Uses eye detection for strict validation
        """
        try:
            box = face_data['box']
            x1, y1, x2, y2 = box
            
            # Extract face region
            face_roi = image[y1:y2, x1:x2]
            if face_roi.size == 0:
                return False, "Invalid face region"
            
            # Check face aspect ratio (human faces are roughly 1:1.2 to 1:1.5)
            face_w = x2 - x1
            face_h = y2 - y1
            aspect = face_h / max(face_w, 1)
            
            if aspect < 0.7 or aspect > 2.0:
                return False, "Invalid face proportions - please face the camera directly"
            
            # Try eye detection for human validation (STRICT)
            if self.eye_cascade is not None:
                gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
                eyes = self.eye_cascade.detectMultiScale(
                    gray_face,
                    scaleFactor=1.1,
                    minNeighbors=3,
                    minSize=(15, 15)
                )
                
                # At least one eye should be detected for a valid human face
                if len(eyes) >= 1:
                    return True, ""
                
                # Only accept without eyes if DNN detected with VERY high confidence
                # This prevents covered faces / non-face objects from passing
                if face_data.get('confidence', 0) >= 0.85 and face_data.get('method') == 'dnn':
                    print(f"[FaceService] Warning: No eyes detected but DNN confidence is very high ({face_data['confidence']:.2f})")
                    return True, ""
                
                return False, "No clear face features detected - ensure face is uncovered with good lighting"
            
            # If no eye cascade available, require higher confidence
            if face_data.get('confidence', 0) >= 0.7:
                return True, ""
            
            return False, "Face validation failed - please try again with clearer face visibility"
            
        except Exception as e:
            print(f"[FaceService] Face validation error: {e}")
            # Only accept on error if detection confidence was very high
            if face_data.get('confidence', 0) >= 0.8:
                return True, ""
            return False, "Face validation failed - please try again"
    
    def generate_face_encoding(self, image: np.ndarray, face_data: Dict) -> Optional[List[float]]:
        """
        Generate 512-D face encoding using histogram + spatial features
        No external ML models needed - pure OpenCV
        """
        try:
            box = face_data['box']
            x1, y1, x2, y2 = box
            
            # Extract and resize face to standard size
            face_roi = image[y1:y2, x1:x2]
            if face_roi.size == 0:
                return None
            
            face_resized = cv2.resize(face_roi, (128, 128))
            
            # === Feature Vector Construction (512-D) ===
            features = []
            
            # 1. Color histograms per channel (3 channels x 64 bins = 192 features)
            for channel in range(3):
                hist = cv2.calcHist([face_resized], [channel], None, [64], [0, 256])
                hist = hist.flatten() / (hist.sum() + 1e-7)  # Normalize
                features.extend(hist.tolist())
            
            # 2. LBP-like texture features (Local Binary Pattern approximation)
            gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
            
            # Divide face into 4x4 grid regions
            grid_h, grid_w = gray.shape[0] // 4, gray.shape[1] // 4
            for gy in range(4):
                for gx in range(4):
                    region = gray[gy*grid_h:(gy+1)*grid_h, gx*grid_w:(gx+1)*grid_w]
                    # Per-region: mean, std, gradient magnitude
                    features.append(float(np.mean(region)) / 255.0)
                    features.append(float(np.std(region)) / 255.0)
                    
                    # Gradient features
                    gx_grad = cv2.Sobel(region, cv2.CV_64F, 1, 0, ksize=3)
                    gy_grad = cv2.Sobel(region, cv2.CV_64F, 0, 1, ksize=3)
                    mag = np.sqrt(gx_grad**2 + gy_grad**2)
                    features.append(float(np.mean(mag)) / 255.0)
            
            # 3. HOG-like features (gradient orientation histograms)
            # Compute gradients
            gx_full = cv2.Sobel(gray.astype(np.float32), cv2.CV_64F, 1, 0, ksize=3)
            gy_full = cv2.Sobel(gray.astype(np.float32), cv2.CV_64F, 0, 1, ksize=3)
            magnitude = np.sqrt(gx_full**2 + gy_full**2)
            orientation = np.arctan2(gy_full, gx_full) * 180 / np.pi
            orientation[orientation < 0] += 360
            
            # HOG for 4x4 grid, 9 orientation bins each = 144 features
            for gy in range(4):
                for gx in range(4):
                    mag_region = magnitude[gy*grid_h:(gy+1)*grid_h, gx*grid_w:(gx+1)*grid_w]
                    ori_region = orientation[gy*grid_h:(gy+1)*grid_h, gx*grid_w:(gx+1)*grid_w]
                    hist, _ = np.histogram(ori_region, bins=9, range=(0, 360), weights=mag_region)
                    hist = hist / (hist.sum() + 1e-7)
                    features.extend(hist.tolist())
            
            # 4. Edge density features for key face regions
            edges = cv2.Canny(gray, 50, 150)
            # Split into top/middle/bottom thirds (eye region, nose, mouth)
            third_h = gray.shape[0] // 3
            for i in range(3):
                region = edges[i*third_h:(i+1)*third_h, :]
                features.append(float(np.sum(region) / region.size) / 255.0)
            
            # Current: 192 + 48 + 144 + 3 = 387 features
            # Pad or truncate to exactly 512
            feature_vec = np.array(features, dtype=np.float32)
            
            if len(feature_vec) < 512:
                # Pad with spatial frequency features
                dct_gray = cv2.dct(gray.astype(np.float32) / 255.0)
                dct_features = dct_gray[:16, :8].flatten()  # 128 DCT coefficients
                dct_normalized = dct_features / (np.max(np.abs(dct_features)) + 1e-7)
                
                padding_needed = 512 - len(feature_vec)
                feature_vec = np.concatenate([feature_vec, dct_normalized[:padding_needed]])
            
            feature_vec = feature_vec[:512]  # Ensure exactly 512
            
            # L2 normalize
            norm = np.linalg.norm(feature_vec)
            if norm > 0:
                feature_vec = feature_vec / norm
            
            encoding = feature_vec.tolist()
            print(f"[FaceService] Generated OpenCV encoding: {len(encoding)}-D")
            return encoding
            
        except Exception as e:
            print(f"[FaceService] Encoding error: {e}")
            import traceback
            traceback.print_exc()
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
