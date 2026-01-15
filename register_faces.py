"""
One-time Face Registration Script

Purpose:
- Batch register face embeddings from images into SQLite database
- Loads images from ./registration_images/ directory
- Extracts voter_id from filename (without extension)
- Detects faces, generates embeddings, and stores in database

Requirements:
- Images should be in ./registration_images/ directory
- Filename format: <voter_id>.<extension> (e.g., "XWC9340241.jpg")
- Each image must contain exactly one face
- Uses existing YOLO detector and FaceNet/ArcFace embedder
- Skips voter_id if already exists in database
"""

import os
import sys
from pathlib import Path
import cv2
import numpy as np

# Import existing face detection, embedding, and storage modules
from backend.face import get_detector, get_embedder, get_storage


def get_image_files(directory: str) -> list:
    """
    Get all image files from the specified directory.
    
    Args:
        directory: Path to directory containing images
        
    Returns:
        List of image file paths
    """
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'}
    image_files = []
    
    directory_path = Path(directory)
    
    if not directory_path.exists():
        print(f"Error: Directory '{directory}' does not exist.")
        return []
    
    if not directory_path.is_dir():
        print(f"Error: '{directory}' is not a directory.")
        return []
    
    # Get all image files
    for file_path in directory_path.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in image_extensions:
            image_files.append(file_path)
    
    return sorted(image_files)


def extract_voter_id(filename: str) -> str:
    """
    Extract voter_id from filename by removing the extension.
    
    Args:
        filename: Image filename (e.g., "XWC9340241.jpg")
        
    Returns:
        Voter ID without extension (e.g., "XWC9340241")
    """
    # Get filename without path
    base_name = os.path.basename(filename)
    # Remove extension
    voter_id = os.path.splitext(base_name)[0]
    return voter_id


def load_image(image_path: Path) -> np.ndarray:
    """
    Load image from file path.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Image as numpy array (BGR format for OpenCV)
    """
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f"Failed to load image: {image_path}")
    return image


def process_image_for_embedding(image: np.ndarray, detector) -> tuple:
    """
    Process image to extract face and prepare for embedding generation.
    
    Steps:
    1. Detect face using YOLO detector
    2. Reject if face count ≠ 1
    3. Return cropped face image as base64 (for embedder compatibility)
    
    Args:
        image: Input image as numpy array (BGR format)
        detector: FaceDetector instance
        
    Returns:
        Tuple of (success, cropped_face_image, error_message)
    """
    # Convert image to base64 for detector (it expects base64 input)
    # Encode image to JPEG
    _, buffer = cv2.imencode('.jpg', image)
    # Convert to base64
    import base64
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # Detect face using YOLO detector
    # This will reject if face count ≠ 1
    success, cropped_face_base64, error_message = detector.detect_face(image_base64)
    
    if not success:
        return False, None, error_message
    
    # Decode cropped face back to numpy array for embedding
    # Remove data URL prefix if present
    base64_str = cropped_face_base64
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]
    
    # Decode base64 to image
    image_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(image_data, np.uint8)
    cropped_face_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if cropped_face_image is None:
        return False, None, "Failed to decode cropped face image"
    
    return True, cropped_face_image, None


def register_face_from_image(
    image_path: Path,
    detector,
    embedder,
    storage
) -> tuple:
    """
    Register a single face from an image file.
    
    Steps:
    1. Extract voter_id from filename
    2. Check if voter_id already exists (skip if exists)
    3. Load image
    4. Detect face (reject if face count ≠ 1)
    5. Generate embedding using FaceNet/ArcFace
    6. Store embedding in SQLite database
    
    Args:
        image_path: Path to image file
        detector: FaceDetector instance
        embedder: FaceEmbedder instance
        storage: FaceStorage instance
        
    Returns:
        Tuple of (voter_id, success, message)
    """
    # Step 1: Extract voter_id from filename (without extension)
    voter_id = extract_voter_id(str(image_path))
    
    print(f"\nProcessing: {image_path.name} (voter_id: {voter_id})")
    
    # Step 2: Check if voter_id already exists in database
    if storage.voter_exists(voter_id):
        return voter_id, False, f"SKIPPED: voter_id '{voter_id}' already exists in database"
    
    try:
        # Step 3: Load image from file
        image = load_image(image_path)
        print(f"  ✓ Image loaded successfully")
        
        # Step 4: Detect face using YOLO detector
        # This will reject if face count ≠ 1
        print(f"  → Detecting face...")
        success, cropped_face_image, error_message = process_image_for_embedding(image, detector)
        
        if not success:
            return voter_id, False, f"Face detection failed: {error_message}"
        
        print(f"  ✓ Face detected successfully (exactly 1 face)")
        
        # Step 5: Generate embedding using FaceNet/ArcFace
        # The embedder expects numpy array (BGR format)
        print(f"  → Generating embedding...")
        embedding = embedder.generate_embedding(cropped_face_image)
        
        # Embedding is already a numpy array, no need to convert to list
        # The storage module will handle serialization
        print(f"  ✓ Embedding generated (shape: {embedding.shape})")
        
        # Step 6: Store embedding in SQLite database
        # Use voter_id as full_name if not available
        print(f"  → Storing in database...")
        store_success, store_error = storage.store_embedding(
            voter_id=voter_id,
            full_name=voter_id,  # Use voter_id as name since we don't have full name
            embedding=embedding
        )
        
        if not store_success:
            return voter_id, False, f"Database storage failed: {store_error}"
        
        print(f"  ✓ Successfully stored in database")
        return voter_id, True, "Registration successful"
        
    except Exception as e:
        error_msg = f"Error processing image: {str(e)}"
        print(f"  ✗ {error_msg}")
        return voter_id, False, error_msg


def main():
    """
    Main function to batch register faces from images.
    """
    print("=" * 70)
    print("Face Registration Script")
    print("=" * 70)
    print()
    
    # Configuration
    registration_dir = "./registration_images"
    
    # Step 1: Get all image files from registration directory
    print(f"Step 1: Loading images from '{registration_dir}'...")
    image_files = get_image_files(registration_dir)
    
    if not image_files:
        print(f"\nNo image files found in '{registration_dir}'.")
        print("Please ensure the directory exists and contains image files.")
        print("Expected filename format: <voter_id>.<extension> (e.g., 'XWC9340241.jpg')")
        sys.exit(1)
    
    print(f"Found {len(image_files)} image file(s)")
    print()
    
    # Step 2: Initialize face detection, embedding, and storage modules
    print("Step 2: Initializing modules...")
    print("  → Loading YOLO face detector...")
    detector = get_detector()
    print("  ✓ Face detector loaded")
    
    print("  → Loading FaceNet/ArcFace embedder...")
    embedder = get_embedder()
    print("  ✓ Face embedder loaded")
    
    print("  → Initializing SQLite storage...")
    storage = get_storage()
    print("  ✓ Storage initialized")
    print()
    
    # Step 3: Process each image
    print("Step 3: Processing images...")
    print("=" * 70)
    
    results = {
        'success': [],
        'failed': [],
        'skipped': []
    }
    
    for image_path in image_files:
        voter_id, success, message = register_face_from_image(
            image_path,
            detector,
            embedder,
            storage
        )
        
        if success:
            results['success'].append((voter_id, message))
        elif 'SKIPPED' in message:
            results['skipped'].append((voter_id, message))
        else:
            results['failed'].append((voter_id, message))
    
    # Step 4: Print summary
    print()
    print("=" * 70)
    print("Registration Summary")
    print("=" * 70)
    print(f"Total images processed: {len(image_files)}")
    print(f"  ✓ Successful: {len(results['success'])}")
    print(f"  ⊘ Skipped (already exists): {len(results['skipped'])}")
    print(f"  ✗ Failed: {len(results['failed'])}")
    print()
    
    # Print detailed results
    if results['success']:
        print("Successful registrations:")
        for voter_id, message in results['success']:
            print(f"  ✓ {voter_id}: {message}")
        print()
    
    if results['skipped']:
        print("Skipped (already exists):")
        for voter_id, message in results['skipped']:
            print(f"  ⊘ {voter_id}: {message}")
        print()
    
    if results['failed']:
        print("Failed registrations:")
        for voter_id, message in results['failed']:
            print(f"  ✗ {voter_id}: {message}")
        print()
    
    print("=" * 70)
    print("Registration complete!")
    print("=" * 70)


if __name__ == "__main__":
    main()

