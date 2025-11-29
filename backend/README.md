# FitPrint AI Backend

FastAPI backend for AI-powered outfit recommendations using GPT4All.

## Setup

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run the backend:**
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### `GET /`
Health check endpoint.

### `GET /health`
Health check endpoint.

### `POST /generate-response`
Generate AI response for outfit recommendations.

**Request Body:**
```json
{
  "message": "I'm going to a job interview",
  "occasion": "business",
  "wardrobeItems": [
    {
      "id": "1",
      "name": "Blue Shirt",
      "color": "Blue",
      "category": "tops",
      "colorHex": "#4169E1"
    }
  ],
  "outfitDescriptions": [
    "Blue Shirt + Khaki Chinos + Brown Leather Shoes"
  ]
}
```

**Response:**
```json
{
  "message": "Perfect! I've curated 3 stylish outfits...",
  "reasoning": null
}
```

### `POST /generate-reasoning`
Generate AI reasoning for a specific outfit.

## Model Download

GPT4All will automatically download the model on first use. The model file will be cached locally.

Model used: `ggml-gpt4all-j` (~4GB download on first use, but faster inference than Mistral)

## Notes

- The model is lazy-loaded (only loaded when first needed)
- If GPT4All fails to load, the API falls back to rule-based responses
- CORS is configured to allow requests from `http://localhost:3000` (Next.js dev server)

