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
- **Backend**: Next.js API Routes
- **AI Integration**: Hugging Face API (optional)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables (Optional)

For enhanced AI recommendations, set up Hugging Face API:

```env
HUGGINGFACE_API_KEY=your_api_key_here
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── recommend/    # AI recommendation API
│   ├── analytics/        # Analytics dashboard
│   ├── recommendations/  # Outfit recommendations
│   ├── wardrobe/         # Wardrobe management
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable UI components
├── lib/                  # Utility functions
└── types/                # TypeScript types
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
