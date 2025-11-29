# FitPrint

AI-powered digital wardrobe and styling platform. Organize your clothes, get AI-powered outfit recommendations, and track your style with analytics.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd FitPrint
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Start the backend** (in one terminal)
   ```bash
   cd backend
   python main.py
   ```
   The backend will run on `http://localhost:8000`. The AI model will download automatically on first use (~2-4GB).

5. **Start the frontend** (in another terminal)
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

## 📱 How to Use FitPrint

### 1. **My Closet** - Manage Your Wardrobe

**Adding Items:**
- Click the **"+"** button at the bottom of the wardrobe page
- **Option A**: Upload a photo of your clothing item
  - The AI will automatically detect the category, color, and suggest a name
  - Review and edit the suggestions before saving
- **Option B**: Manually enter details
  - Select category (tops, bottoms, shoes, etc.)
  - Choose color
  - Enter item name
  - Select occasions (casual, formal, business, etc.)

**Managing Items:**
- **View items**: Scroll through your wardrobe organized by category
- **Favorite items**: Click the heart icon to mark favorites
- **Delete items**: Click the delete button on any item card
- **Search**: Use the search bar to find specific items by name or color

### 2. **AI Stylist** - Get Outfit Recommendations

**Using the Chat:**
- Click the **chat bubble icon** in the bottom right corner
- Type your request in natural language, for example:
  - "I'm going to a job interview"
  - "Help me pick an outfit for a party"
  - "I need something casual for school"
  - "I'm feeling cold, what should I wear?"
  - "What should I wear on a date?"

**How It Works:**
- The AI analyzes your wardrobe and occasion
- It suggests 5 outfit combinations based on:
  - Color harmony
  - Occasion appropriateness
  - Style coordination
- Each outfit includes reasoning explaining why it works

**Tips:**
- Be specific about the occasion for better recommendations
- Mention weather conditions (cold, hot, rainy) for appropriate suggestions
- The AI learns from your wardrobe, so add more items for better variety

### 3. **Recommendations** - Browse Outfit Ideas

- View all AI-generated outfit recommendations
- See outfit combinations with reasoning
- Filter by occasion
- Save your favorite combinations

### 4. **My Profile** - Analytics & Insights

**View Analytics:**
- **Color Distribution**: See which colors dominate your wardrobe
- **Category Breakdown**: View distribution of tops, bottoms, shoes, etc.
- **Most Worn Items**: Track your favorite pieces
- **Cost Per Wear**: See the value of your items based on usage

**Recycle Bin:**
- View deleted items
- Restore items you accidentally deleted
- Permanently delete items you no longer want

## 🎨 Features

### AI-Powered Image Classification
- Upload photos of your clothes
- Automatic detection of:
  - Clothing category (shirt, pants, shoes, etc.)
  - Color
  - Suggested name

### Smart Outfit Recommendations
- AI analyzes your wardrobe
- Suggests combinations based on:
  - Color harmony rules
  - Occasion appropriateness
  - Style coordination
- Natural language chat interface

### Privacy-First
- **100% Local Processing**: All AI runs on your device or local server
- **No API Keys Required**: Uses open-source models
- **No Data Collection**: Your wardrobe stays private

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Image Classification**: TensorFlow.js + MobileNet (client-side)

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **AI Model**: GPT4All (Orca Mini 3B)
- **Language**: Python 3.11+

### AI & Machine Learning
- **Text Generation**: GPT4All with Orca Mini 3B model (~2GB)
  - Runs locally on backend
  - No API keys required
  - Privacy-first approach
- **Image Classification**: TensorFlow.js MobileNet
  - Runs entirely in browser
  - No server upload needed
  - Real-time classification

### Data Storage
- **Client-side**: Browser LocalStorage
- **No Database**: All data stored locally in browser
- **Privacy**: No cloud storage, no data collection

### Development Tools
- **Package Manager**: npm (Node.js)
- **Python Package Manager**: pip
- **Type Checking**: TypeScript
- **Code Quality**: ESLint

## 🔧 Technical Details

### Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI Models**:
  - **Text Generation**: GPT4All (Orca Mini 3B) - runs locally
  - **Image Classification**: TensorFlow.js MobileNet - runs in browser

### Model Information
- **GPT4All Model**: `orca-mini-3b-gguf2-q4_0.gguf` (~2GB)
- **Download**: Automatic on first backend startup
- **Location**: `~/.local/share/gpt4all/` (Linux/Mac) or `%USERPROFILE%\.local\share\gpt4all\` (Windows)

## 💡 Tips & Tricks

1. **Better Recommendations**: Add more items to your wardrobe for more outfit variety
2. **Accurate Colors**: Upload clear photos in good lighting for better color detection
3. **Occasion Tags**: Tag items with appropriate occasions for better filtering
4. **Favorites**: Mark your favorite items to help the AI prioritize them
5. **Search**: Use the search bar to quickly find items when building outfits

## 🐛 Troubleshooting

**Backend not starting?**
- Make sure Python 3.8+ is installed
- Check that all dependencies are installed: `pip install -r backend/requirements.txt`
- Verify port 8000 is not in use

**AI not working?**
- Check that the backend is running on `http://localhost:8000`
- Look at backend terminal for model loading messages
- First model download can take 5-10 minutes (one-time)

**Image classification not working?**
- Make sure you're using a modern browser (Chrome, Firefox, Edge)
- Check browser console for errors
- Try refreshing the page

**Frontend not loading?**
- Make sure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check that port 3000 is not in use

## 📝 Notes

- All data is stored locally in your browser (LocalStorage)
- Clearing browser data will remove your wardrobe
- The AI model downloads automatically on first backend startup
- Model loading takes 10-30 seconds on first request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details
