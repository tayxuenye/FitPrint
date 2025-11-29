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

# Initialize GPT4All model (pre-load at startup)
gpt4all_model = None
model_load_error = None

def load_model_at_startup():
    """Pre-load GPT4All model at server startup"""
    global gpt4all_model, model_load_error
    if gpt4all_model is None and model_load_error is None:
        try:
            from gpt4all import GPT4All
            print("=" * 60)
            print("Loading GPT4All model... This may take a moment on first use.")
            print("Model will be downloaded automatically on first use.")
            print("=" * 60)
            
            # Try to list available models first (GPT4All v2.6.0+)
            available_model_names = []
            try:
                available_models = GPT4All.list_models()
                # Extract model names from dict/list (handle both formats)
                if available_models:
                    if isinstance(available_models[0], dict):
                        available_model_names = [m.get('filename', m.get('name', str(m))) for m in available_models[:10]]
                    else:
                        available_model_names = [str(m) for m in available_models[:10]]
                    print(f"📋 Found {len(available_model_names)} available models")
                    print(f"📋 Sample models: {available_model_names[:3]}")
            except Exception as list_error:
                print(f"⚠️ Could not list models: {list_error}")
                available_model_names = []
            
            # Try different model name formats (GPT4All v2.6.0+ uses different names)
            # Prioritize smaller/faster models - orca-mini-3b is fast and good quality
            model_names = [
                "orca-mini-3b-gguf2-q4_0.gguf",       # Orca Mini (smaller, faster) - RECOMMENDED
                "orca-mini-3b-gguf",                  # Alternative format
                "mistral-7b-openorca.Q4_0.gguf",      # Mistral (larger but better quality)
                "gpt4all-falcon-newbpe-q4_0.gguf",    # Falcon (balanced)
                "ggml-gpt4all-j-v1.3-groovy",         # GPT4All-J (original request)
                "gpt4all-j-v1.3-groovy",              # Alternative format
                "ggml-gpt4all-j",                     # Original name
            ]
            
            # If we got a list of available models, prioritize those that match
            if available_model_names:
                # Extract just the base names for matching (ensure all are strings)
                available_basenames = []
                for name in available_model_names:
                    name_str = str(name).split('/')[-1].lower() if name else ""
                    if name_str:
                        available_basenames.append(name_str)
                
                # Prioritize models that are in the available list
                prioritized = []
                remaining = []
                for m in model_names:
                    m_lower = m.lower()
                    if any(m_lower in bn or bn in m_lower for bn in available_basenames):
                        prioritized.append(m)
                    else:
                        remaining.append(m)
                model_names = prioritized + remaining
            
            model_loaded = False
            last_error = None
            
            for model_name in model_names:
                try:
                    print(f"🔄 Trying model: {model_name}")
                    # The model will be downloaded to ~/.local/share/gpt4all/ on first use
                    gpt4all_model = GPT4All(model_name, device="cpu")
                    print("=" * 60)
                    print(f"✅ GPT4All model '{model_name}' loaded successfully!")
                    print("=" * 60)
                    model_loaded = True
                    break
                except Exception as model_error:
                    error_str = str(model_error)
                    print(f"⚠️ Failed to load '{model_name}': {error_str[:150]}")
                    last_error = model_error
                    gpt4all_model = None
                    continue
            
            if not model_loaded:
                raise Exception(f"Failed to load any GPT4All model. Last error: {last_error}")
        except ImportError as e:
            error_msg = f"GPT4All library not installed: {e}"
            print(f"❌ {error_msg}")
            print("💡 Install with: pip install gpt4all")
            model_load_error = error_msg
        except Exception as e:
            error_msg = f"Error loading GPT4All model: {e}"
            print(f"❌ {error_msg}")
            print("💡 Check if model name is correct and internet connection is available for download")
            import traceback
            traceback.print_exc()
            model_load_error = error_msg
    elif model_load_error:
        print(f"⚠️ Model load error (cached): {model_load_error}")
    return gpt4all_model

def get_model():
    """Get the pre-loaded model (returns None if not loaded)"""
    return gpt4all_model

@app.on_event("startup")
async def startup_event():
    """Pre-load model when server starts"""
    print("\n" + "=" * 60)
    print("🚀 Server starting - loading AI model...")
    print("=" * 60)
    load_model_at_startup()
    if gpt4all_model:
        print("✅ Model pre-loaded! Server ready to handle requests.")
    else:
        print("⚠️ Model failed to load - will use rule-based fallbacks")
    print("=" * 60 + "\n")

@app.get("/")
def read_root():
    return {"message": "FitPrint AI Backend is running"}

@app.get("/health")
def health_check():
    print("🔍 Health check called - checking model status...")
    model = get_model()
    status = {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_error": model_load_error if model is None else None
    }
    print(f"📊 Health status: {status}")
    return status

@app.get("/test-model")
def test_model():
    """Test endpoint to force model loading and see output"""
    print("\n" + "=" * 60)
    print("🧪 TEST MODEL ENDPOINT CALLED")
    print("=" * 60)
    model = get_model()
    if model:
        return {
            "status": "success",
            "message": "Model loaded successfully!",
            "model_type": str(type(model))
        }
    else:
        return {
            "status": "failed",
            "message": "Model failed to load",
            "error": model_load_error
        }

@app.post("/generate-response", response_model=GenerateResponseResponse)
async def generate_response(request: GenerateResponseRequest):
    """Generate AI response for outfit recommendations"""
    try:
        model = get_model()
        
        if model is None:
            # Fallback to rule-based response
            error_info = f" (Error: {model_load_error})" if model_load_error else ""
            print(f"⚠️ GPT4All model not available - using rule-based fallback{error_info}")
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
        
        # Simpler, more direct prompt for orca-mini-3b
        outfit_list = "\n".join([f"- {desc}" for desc in request.outfitDescriptions[:5]])
        prompt = f"""User: {request.message}

I have {len(request.outfitDescriptions)} outfit recommendations for {request.occasion or 'casual'}:
{outfit_list}
{weather_context}

Provide a friendly 2-3 sentence response introducing these outfit recommendations. Be enthusiastic and helpful.

Assistant:"""

        # Generate response with GPT4All
        print("🤖 Generating AI response...")
        print(f"📝 Prompt length: {len(prompt)} characters")
        try:
            # Try with different parameters for orca-mini-3b
            response = model.generate(
                prompt,
                max_tokens=150,  # Increased for better responses
                temp=0.9,  # Higher temperature for more creative responses
                top_k=40,
                top_p=0.95,
                repeat_penalty=1.1,  # Lower repeat penalty
            )
            print(f"📝 Raw AI response (full): {repr(response)}")  # Use repr to see hidden chars
            print(f"📏 Response length: {len(response) if response else 0}")
            print(f"📏 Response type: {type(response)}")
        except Exception as gen_error:
            print(f"❌ Error during generation: {gen_error}")
            import traceback
            traceback.print_exc()
            response = ""
        
        # Clean up response - remove quotes and extra whitespace
        response = response.strip()
        
        # Remove surrounding quotes if present
        if response.startswith('"') and response.endswith('"'):
            response = response[1:-1]
        if response.startswith("'") and response.endswith("'"):
            response = response[1:-1]
        
        # Extract just the first sentence or paragraph (AI might generate too much)
        # Split by newlines and take the first meaningful paragraph
        lines = response.split('\n')
        cleaned_lines = [line.strip() for line in lines if line.strip()]
        if cleaned_lines:
            # Take first 2-3 sentences that are relevant
            response = ' '.join(cleaned_lines[:2])[:300]  # Limit to 300 chars
        
        # Filter gibberish (more lenient)
        gibberish_patterns = ["The first thing", "How to", "Let's talk about", "(source)", "source)", "Wikipedia", "according to"]
        has_gibberish = any(pattern.lower() in response.lower() for pattern in gibberish_patterns)
        
        # More lenient validation - accept shorter responses
        if has_gibberish:
            print(f"⚠️ AI response filtered (gibberish detected): {response[:100]}")
            # Fallback with context
            occasion_context = request.occasion or "casual"
            if is_cold:
                response = f"Perfect! I've curated {len(request.outfitDescriptions)} warm and stylish outfit{'s' if len(request.outfitDescriptions) > 1 else ''} for when you're feeling cold. These combinations will help keep you cozy while looking great!"
            elif is_hot:
                response = f"Perfect! I've curated {len(request.outfitDescriptions)} lightweight and breathable outfit{'s' if len(request.outfitDescriptions) > 1 else ''} for when you're feeling hot. These combinations will keep you cool and comfortable!"
            else:
                response = f"Perfect! I've curated {len(request.outfitDescriptions)} stylish outfit{'s' if len(request.outfitDescriptions) > 1 else ''} for your {occasion_context}. Each combination is carefully selected from your wardrobe to help you look your best!"
            return GenerateResponseResponse(message=response, reasoning=None, ai_used=False)
        elif len(response) < 10:
            print(f"⚠️ AI response too short ({len(response)} chars) - using fallback")
            occasion_context = request.occasion or "casual"
            response = f"Perfect! I've curated {len(request.outfitDescriptions)} stylish outfit{'s' if len(request.outfitDescriptions) > 1 else ''} for your {occasion_context}. Each combination is carefully selected from your wardrobe to help you look your best!"
            return GenerateResponseResponse(message=response, reasoning=None, ai_used=False)
        else:
            print(f"✅ AI response accepted: {response[:100]}...")
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

