# FitPrint

AI-powered digital wardrobe and styling platform

## Features

- **📱 Mobile-First UI** - Optimized for iPhone viewing mode on laptop
- **🧥 Wardrobe Management** - Upload and manage your clothing items with images or predefined options
- **✨ AI Outfit Recommendations** - Get smart outfit suggestions based on color harmony and occasion
- **📊 Analytics Dashboard** - View color trends, item usage frequency, and wardrobe insights

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **Backend**: FastAPI (Python) for AI text generation
- **AI Integration**: GPT4All (Mistral 7B) for outfit recommendations
- **Image Classification**: TensorFlow.js MobileNet (client-side)
- **Deployment**: Vercel-ready (frontend), separate backend deployment needed

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- npm or yarn
- pip (Python package manager)

### Installation

#### 1. Frontend (Next.js)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will run on `http://localhost:3000`

#### 2. Backend (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI server
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

The backend will run on `http://localhost:8000`

### Environment Variables

**No API keys needed!** The app uses:

- **Image Classification**: TensorFlow.js MobileNet (client-side, pretrained)
- **AI Text Generation**: GPT4All (Mistral 7B) running locally via FastAPI backend
- **100% Privacy**: All AI processing happens locally, no data sent to external servers
- **Model Download**: GPT4All will automatically download the model (~4GB) on first use

**Optional**: Set `NEXT_PUBLIC_API_URL` in `.env.local` if your backend runs on a different URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
├── backend/              # FastAPI backend
│   ├── main.py          # FastAPI app with GPT4All
│   ├── requirements.txt # Python dependencies
│   └── README.md        # Backend documentation
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── recommend/    # AI recommendation API
│   │   ├── analytics/        # Analytics dashboard
│   │   ├── recommendations/  # Outfit recommendations
│   │   ├── wardrobe/         # Wardrobe management
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript types
└── package.json
```

## Demo Mode

The app comes pre-loaded with sample wardrobe items for demonstration purposes. You can:

1. **View Wardrobe** - See sample clothing items organized by category
2. **Add Items** - Upload photos or use predefined color/category options
3. **Get Recommendations** - Select items and an occasion to get AI outfit suggestions
4. **View Analytics** - See color distribution, category breakdown, and most-worn items

## Deployment on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tayxuenye/FitPrint)

1. Click the button above or import from GitHub
2. Configure environment variables (optional)
3. Deploy

## License

MIT License - see [LICENSE](LICENSE) for details
