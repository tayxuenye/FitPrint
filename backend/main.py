from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="FitPrint AI Backend")

# CORS middleware to allow Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class OutfitItem(BaseModel):
    id: str
    name: str
    color: str
    category: str
    colorHex: str

class GenerateResponseRequest(BaseModel):
    message: str
    occasion: Optional[str] = None
    wardrobeItems: List[OutfitItem]
    outfitDescriptions: List[str]

class GenerateResponseResponse(BaseModel):
    message: str
    reasoning: Optional[str] = None
    ai_used: bool = False  # Indicates if AI was used or fallback

# Initialize GPT4All model (lazy loading)
gpt4all_model = None

def get_model():
    """Lazy load GPT4All model on first use"""
    global gpt4all_model
    if gpt4all_model is None:
        try:
            from gpt4all import GPT4All
            print("Loading GPT4All-J model... This may take a moment on first use.")
            print("Model will be downloaded automatically (~4GB) on first use.")
            # Use GPT4All-J model - faster and smaller than Mistral
            # The model will be downloaded to ~/.local/share/gpt4all/ on first use
            gpt4all_model = GPT4All("ggml-gpt4all-j", device="cpu")
            print("GPT4All model loaded successfully!")
        except Exception as e:
            print(f"Error loading GPT4All: {e}")
            print("Falling back to rule-based responses")
            gpt4all_model = None  # Keep as None if failed
    return gpt4all_model

@app.get("/")
def read_root():
    return {"message": "FitPrint AI Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/generate-response", response_model=GenerateResponseResponse)
async def generate_response(request: GenerateResponseRequest):
    """Generate AI response for outfit recommendations"""
    try:
        model = get_model()
        
        if model is None:
            # Fallback to rule-based response
            print("⚠️ GPT4All model not available - using rule-based fallback")
            occasion_context = request.occasion or "casual"
            return GenerateResponseResponse(
                message=f"Perfect! I've curated {len(request.outfitDescriptions)} stylish outfit{'s' if len(request.outfitDescriptions) > 1 else ''} for your {occasion_context}. Each combination is carefully selected from your wardrobe to help you look your best!",
                reasoning=None,
                ai_used=False
            )
        
        print("✅ Using GPT4All AI for response generation")
        
        # Build prompt for GPT4All
        wardrobe_desc = ", ".join([f"{item.name} ({item.color} {item.category})" for item in request.wardrobeItems[:10]])  # Limit to 10 items
        
        # Detect if user mentioned weather/feeling (cold, hot, warm, etc.)
        user_message_lower = request.message.lower()
        is_cold = any(word in user_message_lower for word in ['cold', 'freezing', 'chilly', 'cool'])
        is_hot = any(word in user_message_lower for word in ['hot', 'warm', 'sweating'])
        
        weather_context = ""
        if is_cold:
            weather_context = " The user mentioned feeling cold, so emphasize warmth and layering."
        elif is_hot:
            weather_context = " The user mentioned feeling hot, so emphasize lightweight and breathable options."
        
        prompt = f"""As a fashion stylist, a user said: "{request.message}"

Their wardrobe includes: {wardrobe_desc}

I found {len(request.outfitDescriptions)} outfit combinations for {request.occasion or 'casual'}:
{chr(10).join([f"{i+1}. {desc}" for i, desc in enumerate(request.outfitDescriptions[:5])])}

Provide a friendly, enthusiastic 2-3 sentence response introducing these recommendations.{weather_context} Be conversational and helpful. Keep it concise and fashion-focused. Do not include quotes around your response."""

        # Generate response with GPT4All-J
        print("🤖 Generating AI response with GPT4All-J...")
        response = model.generate(
            prompt,
            max_tokens=100,  # Reduced for faster response
            temp=0.7,
            top_k=40,
            top_p=0.9,
            repeat_penalty=1.2,
        )
        
        print(f"📝 Raw AI response: {response[:100]}...")
        
        # Clean up response - remove quotes and extra whitespace
        response = response.strip()
        
        # Remove surrounding quotes if present
        if response.startswith('"') and response.endswith('"'):
            response = response[1:-1]
        if response.startswith("'") and response.endswith("'"):
            response = response[1:-1]
        
        # Filter gibberish
        gibberish_patterns = ["The first thing", "How to", "Let's talk about", "(source)", "source)"]
        has_gibberish = any(pattern.lower() in response.lower() for pattern in gibberish_patterns)
        
        if has_gibberish or len(response) < 20 or len(response) > 500:
            print("⚠️ AI response filtered (gibberish/invalid) - using contextual fallback")
            # Fallback with context
            occasion_context = request.occasion or "casual"
            if is_cold:
                response = f"Perfect! I've curated {len(request.outfitDescriptions)} warm and stylish outfit{'s' if len(request.outfitDescriptions) > 1 else ''} for when you're feeling cold. These combinations will help keep you cozy while looking great!"
            elif is_hot:
                response = f"Perfect! I've curated {len(request.outfitDescriptions)} lightweight and breathable outfit{'s' if len(request.outfitDescriptions) > 1 else ''} for when you're feeling hot. These combinations will keep you cool and comfortable!"
            else:
                response = f"Perfect! I've curated {len(request.outfitDescriptions)} stylish outfit{'s' if len(request.outfitDescriptions) > 1 else ''} for your {occasion_context}. Each combination is carefully selected from your wardrobe to help you look your best!"
            return GenerateResponseResponse(message=response, reasoning=None, ai_used=False)
        else:
            print("✅ AI response accepted and cleaned")
            return GenerateResponseResponse(message=response, reasoning=None, ai_used=True)
        
    except Exception as e:
        print(f"❌ Error generating response: {e}")
        print("⚠️ Falling back to rule-based response due to error")
        # Fallback response
        occasion_context = request.occasion or "casual"
        return GenerateResponseResponse(
            message=f"Perfect! I've curated {len(request.outfitDescriptions)} stylish outfit{'s' if len(request.outfitDescriptions) > 1 else ''} for your {occasion_context}. Each combination is carefully selected from your wardrobe to help you look your best!",
            reasoning=None,
            ai_used=False
        )

@app.post("/generate-reasoning", response_model=GenerateResponseResponse)
async def generate_reasoning(request: GenerateResponseRequest):
    """Generate AI reasoning for a specific outfit"""
    try:
        model = get_model()
        
        if model is None or not request.outfitDescriptions:
            return GenerateResponseResponse(
                message="A stylish combination that works well together.",
                reasoning=None
            )
        
        items_list = request.outfitDescriptions[0] if request.outfitDescriptions else ""
        colors = [item.color for item in request.wardrobeItems]
        color_list = " and ".join(set(colors))
        
        prompt = f"""As a fashion stylist, explain why these items work well together for {request.occasion or 'casual'}: {items_list}. 

Give a brief, stylish 1-sentence explanation. Be specific about color harmony and style."""

        # Generate reasoning with GPT4All-J
        reasoning = model.generate(
            prompt,
            max_tokens=50,  # Reduced for faster response
            temp=0.6,
            top_k=40,
            top_p=0.9,
            repeat_penalty=1.3,
        )
        
        reasoning = reasoning.strip()
        
        # Filter gibberish
        gibberish_patterns = ["The first thing", "How to", "Let's talk", "(source)"]
        has_gibberish = any(pattern.lower() in reasoning.lower() for pattern in gibberish_patterns)
        
        if has_gibberish or len(reasoning) < 10 or len(reasoning) > 200:
            reasoning = f"This {color_list} combination creates a harmonious look perfect for {request.occasion or 'casual'} occasions."
        
        return GenerateResponseResponse(message=reasoning, reasoning=None)
        
    except Exception as e:
        print(f"Error generating reasoning: {e}")
        colors = [item.color for item in request.wardrobeItems]
        color_list = " and ".join(set(colors))
        return GenerateResponseResponse(
            message=f"This {color_list} combination creates a stylish look perfect for {request.occasion or 'casual'} occasions.",
            reasoning=None
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

