"""
Face Embedding Generation Module

Generates face embeddings using pretrained FaceNet or ArcFace models.
- Uses pretrained models (no training required)
- Input: cropped face image
- Output: embedding vector (128D or 512D)
- Embeddings are non-reversible (one-way transformation)
"""

import base64
import numpy as np
from typing import Optional, Tuple
import cv2
from PIL import Image
import torch
import torch.nn.functional as F

try:
    from facenet_pytorch import MTCNN, InceptionResnetV1
    FACENET_AVAILABLE = True
except ImportError:
    FACENET_AVAILABLE = False
    print("Warning: facenet-pytorch not available. Install with: pip install facenet-pytorch")

try:
    import insightface
    from insightface.app import FaceAnalysis
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False
    print("Warning: insightface not available. Install with: pip install insightface")


class FaceEmbedder:
    """
    Face embedding generator using pretrained FaceNet or ArcFace models.
    
    IMPORTANT: Face embeddings are NON-REVERSIBLE.
    - Embeddings are one-way transformations from face images to fixed-size vectors
    - You CANNOT reconstruct the original face image from an embedding
    - Embeddings are designed for comparison (similarity/distance) between faces
    - They preserve identity information but lose visual details
    - This is by design for privacy and security reasons
    """
    
    def __init__(self, model_type: str = 'facenet', embedding_dim: int = 512):
        """
        Initialize the face embedder with a pretrained model.
        
        Args:
            model_type: 'facenet' or 'arcface' (default: 'facenet')
            embedding_dim: Expected embedding dimension (512 for FaceNet, 512 for ArcFace)
        """
        self.model_type = model_type.lower()
        self.embedding_dim = embedding_dim
        self.model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load the appropriate model
        if self.model_type == 'facenet':
            self._load_facenet()
        elif self.model_type == 'arcface':
            self._load_arcface()
        else:
            raise ValueError(f"Unsupported model type: {model_type}. Use 'facenet' or 'arcface'")
    
    def _load_facenet(self):
        """Load pretrained FaceNet model."""
        if not FACENET_AVAILABLE:
            raise ImportError(
                "facenet-pytorch is not installed. "
                "Install with: pip install facenet-pytorch"
            )
        
        # Load pretrained FaceNet model (InceptionResnetV1)
        # This model produces 512-dimensional embeddings
        # Model weights are automatically downloaded on first use
        self.model = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        
        print(f"FaceNet model loaded on {self.device}")
        print(f"Embedding dimension: 512")
    
    def _load_arcface(self):
        """Load pretrained ArcFace model."""
        if not INSIGHTFACE_AVAILABLE:
            raise ImportError(
                "insightface is not installed. "
                "Install with: pip install insightface"
            )
        
        # Initialize InsightFace app with ArcFace model
        # This will download the model automatically on first use
        self.model = FaceAnalysis(
            name='buffalo_l',  # Large model with best accuracy
            providers=['CPUExecutionProvider']  # Use CPU, change to CUDAExecutionProvider for GPU
        )
        self.model.prepare(ctx_id=0, det_size=(640, 640))
        
        print(f"ArcFace model loaded")
        print(f"Embedding dimension: 512")
    
    def _preprocess_image_facenet(self, image: np.ndarray) -> torch.Tensor:
        """
        Preprocess image for FaceNet model.
        
        Args:
            image: numpy array image (BGR format from OpenCV)
            
        Returns:
            Preprocessed tensor ready for FaceNet
        """
        # Convert BGR to RGB
        if len(image.shape) == 3 and image.shape[2] == 3:
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            image_rgb = image
        
        # Convert to PIL Image
        pil_image = Image.fromarray(image_rgb)
        
        # Resize to 160x160 (FaceNet input size)
        pil_image = pil_image.resize((160, 160), Image.LANCZOS)
        
        # Convert to tensor and normalize
        # FaceNet expects images in range [0, 1] normalized with ImageNet stats
        img_tensor = torch.from_numpy(np.array(pil_image)).float()
        img_tensor = img_tensor.permute(2, 0, 1)  # HWC to CHW
        img_tensor = img_tensor / 255.0  # Normalize to [0, 1]
        
        # Normalize with ImageNet mean and std
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
        img_tensor = (img_tensor - mean) / std
        
        # Add batch dimension
        img_tensor = img_tensor.unsqueeze(0).to(self.device)
        
        return img_tensor
    
    def _preprocess_image_arcface(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess image for ArcFace model.
        
        Args:
            image: numpy array image (BGR format from OpenCV)
            
        Returns:
            Preprocessed image ready for ArcFace
        """
        # ArcFace expects BGR format, so we keep it as is
        # The model will handle preprocessing internally
        return image
    
    def _generate_embedding_facenet(self, image: np.ndarray) -> np.ndarray:
        """
        Generate embedding using FaceNet model.
        
        Args:
            image: numpy array image (BGR format)
            
        Returns:
            Face embedding vector (512D)
        """
        # Preprocess image
        img_tensor = self._preprocess_image_facenet(image)
        
        # Generate embedding (no gradient computation needed)
        with torch.no_grad():
            embedding = self.model(img_tensor)
        
        # L2 normalize the embedding (standard practice for face embeddings)
        embedding = F.normalize(embedding, p=2, dim=1)
        
        # Convert to numpy and squeeze batch dimension
        embedding_np = embedding.cpu().numpy().squeeze()
        
        return embedding_np
    
    def _generate_embedding_arcface(self, image: np.ndarray) -> np.ndarray:
        """
        Generate embedding using ArcFace model.
        
        Args:
            image: numpy array image (BGR format)
            
        Returns:
            Face embedding vector (512D)
        """
        # Preprocess image
        preprocessed_image = self._preprocess_image_arcface(image)
        
        # Run face analysis (detection + recognition)
        faces = self.model.get(preprocessed_image)
        
        if len(faces) == 0:
            raise ValueError("No face detected in image for ArcFace embedding")
        
        # Get embedding from the first (and should be only) face
        # ArcFace embeddings are already normalized
        embedding = faces[0].embedding
        
        return embedding
    
    def generate_embedding(self, image: np.ndarray) -> np.ndarray:
        """
        Generate face embedding from cropped face image.
        
        IMPORTANT: Embeddings are NON-REVERSIBLE.
        - This function converts a face image into a fixed-size vector
        - The original face image CANNOT be reconstructed from the embedding
        - Embeddings are designed for similarity comparison, not image reconstruction
        - This is a one-way transformation for privacy and security
        
        Args:
            image: numpy array representing cropped face image (BGR format from OpenCV)
            
        Returns:
            Face embedding vector as numpy array (512D for FaceNet/ArcFace)
            - Normalized to unit length (L2 norm = 1)
            - Suitable for cosine similarity comparison
        """
        if self.model_type == 'facenet':
            embedding = self._generate_embedding_facenet(image)
        elif self.model_type == 'arcface':
            embedding = self._generate_embedding_arcface(image)
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
        
        return embedding
    
    def generate_embedding_from_base64(self, base64_image: str) -> np.ndarray:
        """
        Generate face embedding from base64 encoded image.
        
        IMPORTANT: Embeddings are NON-REVERSIBLE.
        See generate_embedding() for details.
        
        Args:
            base64_image: Base64 encoded image string
            
        Returns:
            Face embedding vector as numpy array
        """
        # Decode base64 to image
        image = self._decode_base64_image(base64_image)
        
        # Generate embedding
        embedding = self.generate_embedding(image)
        
        return embedding
    
    def _decode_base64_image(self, base64_string: str) -> np.ndarray:
        """
        Decode base64 string to numpy array image.
        
        Args:
            base64_string: Base64 encoded image string
            
        Returns:
            numpy array representing the image (BGR format for OpenCV)
        """
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        
        # Convert to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        
        # Decode image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image from base64 string")
        
        return img


# Global embedder instance (lazy loading)
_embedder_instance: Optional[FaceEmbedder] = None


def get_embedder(model_type: str = 'facenet', embedding_dim: int = 512) -> FaceEmbedder:
    """
    Get or create the global face embedder instance.
    Uses singleton pattern for efficiency.
    
    Args:
        model_type: 'facenet' or 'arcface' (default: 'facenet')
        embedding_dim: Expected embedding dimension (default: 512)
    
    Returns:
        FaceEmbedder instance
    """
    global _embedder_instance
    if _embedder_instance is None:
        _embedder_instance = FaceEmbedder(model_type=model_type, embedding_dim=embedding_dim)
    return _embedder_instance

