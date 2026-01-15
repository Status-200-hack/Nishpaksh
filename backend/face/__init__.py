"""
Face recognition backend: detection, embedding, and storage.

This package now uses DeepFace (ArcFace + RetinaFace) for face detection
and embedding, replacing the older YOLO + custom embedding pipeline.
"""

from .storage import FaceStorage, get_storage

# DeepFace-based embedder is defined in embedder.py
# Import lazily to avoid requiring deepface for scripts that only need storage
# This allows clear_database.py and other storage-only scripts to work without deepface
try:
    from .embedder import FaceEmbedder, get_embedder
except ImportError as e:
    # If deepface or its dependencies are not available, make embedder unavailable
    # but don't fail the entire module import
    FaceEmbedder = None
    def get_embedder():
        raise ImportError(
            "DeepFace embedder is not available. "
            "Install deepface and its dependencies: pip install deepface tf-keras"
        ) from e

__all__ = [
    'FaceEmbedder',
    'get_embedder',
    'FaceStorage',
    'get_storage',
]

