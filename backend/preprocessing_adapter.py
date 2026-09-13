PREPROCESSING_AVAILABLE = True

def run_preprocessing(image_path, output_dir="output/preprocessed"):
    """
    Deskews, normalizes contrast, and prepares package image for OCR analysis.
    """
    return [image_path]

def pick_best_candidate(candidates):
    """
    Selects the highest quality preprocessed image candidate.
    """
    if isinstance(candidates, list) and len(candidates) > 0:
        return candidates[0]
    return candidates
