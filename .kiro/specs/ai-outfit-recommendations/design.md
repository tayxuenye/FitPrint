# Design Document: AI-Powered Outfit Recommendations

## Overview

FitPrint is a mobile-first digital wardrobe application featuring two main views: My Closet and Profile. The My Closet view provides a card-based grid interface for browsing and managing clothing items with search and category filtering. The Profile view displays personalized style insights, wardrobe statistics, and achievement badges. A floating AI Stylist chatbot button provides conversational outfit recommendations.

The system uses AI for image recognition (autofilling item details from photos) and conversational outfit recommendations through a chatbot interface. The architecture follows a client-server pattern with Next.js App Router, utilizing React client components for interactive features and API routes for AI integration. Data persists in browser LocalStorage with real-time statistics calculation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Bottom Navigation: My Closet | Profile              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  My Closet   │  │   Profile    │  │  AI Stylist  │      │
│  │   - Header   │  │   - Stats    │  │   Chatbot    │      │
│  │   - Search   │  │   - Insights │  │   (Floating) │      │
│  │   - Filters  │  │   - Breakdown│  │              │      │
│  │   - Cards    │  │   - Settings │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/upload  │  │  /api/chat   │  │/api/profile  │      │
│  │ (AI autofill)│  │ (AI Stylist) │  │ (statistics) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Image     │  │  AI Stylist  │  │   Profile    │      │
│  │  Recognition │  │    Engine    │  │  Analytics   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services & Storage                 │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Hugging Face│  │ Local Storage│                         │
│  │  Vision API  │  │  (Browser)   │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Client Layer:**
- **My Closet Tab**: Displays "My Digital Closet" header, add button, search bar, category filters (All, Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories), and two-column scrollable card grid
- **Item Cards**: Shows favorite heart icon, clothing image, item name, category, last worn date, and cost per wear
- **Add Item Modal**: Provides image upload with AI autofill or manual entry for name, category, color, occasion, and price (SGD)
- **Profile Tab**: Displays style statistics, insights (favorite style, color preference, style score), wardrobe breakdown by category, and achievement badges
- **AI Stylist Chatbot**: Floating button that opens chat interface with greeting and quick-action options
- **Bottom Navigation**: Two-tab navigation between My Closet and Profile

**API Layer:**
- **/api/upload**: Accepts image files, calls Hugging Face Vision API, returns autofilled metadata
- **/api/chat**: Processes natural language requests, generates outfit recommendations with reasoning
- **/api/profile**: Calculates and returns style statistics, insights, and achievement progress

**Service Layer:**
- **Image Recognition Service**: Extracts item name, category, color, and occasion from clothing photos
- **AI Stylist Engine**: Parses user requests, filters wardrobe by context, generates outfit combinations with explanations
- **Profile Analytics Service**: Computes favorite style, color preference, style score, most loved pieces, and category breakdown

**External Services:**
- **Hugging Face Vision API**: AI-powered image recognition for clothing attributes
- **Browser Local Storage**: Persists wardrobe items, favorites, usage history, and profile data

## Components and Interfaces

### Data Models

```typescript
interface WardrobeItem {
  id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';
  color: string;
  colorHex: string;
  imageUrl?: string; // Optional: may not have image if manually entered
  occasion: string[]; // e.g., ['casual', 'work', 'formal']
  priceSGD?: number; // Purchase price in Singapore Dollars
  usageCount: number;
  lastWorn?: string; // ISO date string
  isFavorite: boolean;
  aiExtracted: boolean; // Whether metadata was AI-extracted or manual
  createdAt: string; // ISO date string
}

interface StyleProfile {
  totalItems: number;
  favoritePieces: number; // Count of items marked as favorite
  eventsPlanned: number;
  outfitsReady: number;
  favoriteStyle: 'casual' | 'formal' | 'sporty' | 'business' | 'streetwear';
  mostLovedPieces: WardrobeItem[]; // Top 3 most worn items
  colorPreference: string; // Most common color in wardrobe
  styleScore: number; // Percentage (0-100) based on outfit coordination
  wardrobeBreakdown: {
    tops: number;
    bottoms: number;
    outerwear: number;
    dresses: number;
    shoes: number;
    accessories: number;
  };
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  icon: string; // Emoji
  description: string;
  unlocked: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  outfits?: Outfit[]; // Included when assistant recommends outfits
  timestamp: string;
}

interface Outfit {
  id: string;
  items: WardrobeItem[];
  occasion: string;
  reasoning: string; // AI explanation for why these items work together
  createdAt: string;
}

interface ImageMetadata {
  suggestedName: string;
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';
  color: string;
  colorHex: string;
  occasion: string[]; // e.g., ['casual', 'work']
  confidence: number; // 0-1
}

interface ChatRequest {
  message: string;
  wardrobeItems: WardrobeItem[];
  conversationHistory?: ChatMessage[];
}

interface ChatResponse {
  message: string;
  outfits?: Outfit[];
}
```

### Service Interfaces

```typescript
interface ImageRecognitionService {
  extractMetadata(imageFile: File): Promise<ImageMetadata>;
  validateImage(imageFile: File): Promise<boolean>;
}

interface AIStylistEngine {
  processMessage(request: ChatRequest): Promise<ChatResponse>;
  generateOutfits(items: WardrobeItem[], context: string): Promise<Outfit[]>;
  parseUserIntent(message: string): { occasion?: string; count?: number };
}

interface ProfileAnalyticsService {
  calculateStyleProfile(items: WardrobeItem[]): StyleProfile;
  determineFavoriteStyle(items: WardrobeItem[]): string;
  calculateStyleScore(items: WardrobeItem[]): number;
  getMostLovedPieces(items: WardrobeItem[], limit: number): WardrobeItem[];
  getColorPreference(items: WardrobeItem[]): string;
  checkAchievements(profile: StyleProfile): Achievement[];
}

interface StorageService {
  saveItem(item: WardrobeItem): Promise<void>;
  getItems(filters?: Partial<WardrobeItem>): Promise<WardrobeItem[]>;
  updateItem(id: string, updates: Partial<WardrobeItem>): Promise<void>;
  deleteItem(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<void>;
  markAsWorn(id: string): Promise<void>;
  getProfile(): Promise<StyleProfile>;
  saveProfile(profile: StyleProfile): Promise<void>;
}
```

## Data Models

### Storage Schema

The application uses browser LocalStorage with the following keys:

- `fitprint:wardrobe:items` - Array of WardrobeItem objects
- `fitprint:profile` - StyleProfile object with statistics and insights
- `fitprint:chat:history` - Array of ChatMessage objects (last 50 messages)
- `fitprint:cache:metadata` - Cached AI image recognition responses

### Data Flow

**Add Item with Image Flow:**
1. User clicks add button, modal opens
2. User uploads image file
3. Client validates file type (JPEG, PNG, WebP) and size (max 5MB)
4. Image sent to `/api/upload` endpoint
5. Server calls Hugging Face Vision API
6. Metadata (name, category, color, occasion) returned to client
7. Modal fields autofilled with metadata
8. User reviews/edits and clicks "Add to Closet"
9. WardrobeItem created and saved to LocalStorage
10. Profile statistics recalculated
11. Modal closes, item appears in grid

**Add Item Manually Flow:**
1. User clicks add button, modal opens
2. User fills in fields manually (no image upload)
3. User clicks "Add to Closet"
4. WardrobeItem created with aiExtracted=false
5. Item saved to LocalStorage
6. Profile statistics recalculated
7. Modal closes, item appears in grid

**AI Stylist Chat Flow:**
1. User clicks floating AI Stylist button
2. Chat interface opens with greeting and quick options
3. User sends message (e.g., "I need an outfit for a job interview")
4. Message sent to `/api/chat` with wardrobe items
5. Server parses intent (occasion: formal/business)
6. AIStylistEngine filters items by occasion
7. Engine generates outfit combinations with color harmony
8. Top 3-5 outfits returned with reasoning
9. Chat displays outfits with images and explanations
10. User can continue conversation for refinements

**Profile Statistics Flow:**
1. User navigates to Profile tab
2. Client calls ProfileAnalyticsService with wardrobe items
3. Service calculates:
   - Total items, favorites count
   - Favorite style (most common occasion tag)
   - Color preference (most common color)
   - Style score (based on outfit coordination potential)
   - Wardrobe breakdown by category
   - Most loved pieces (highest usage count)
4. Achievements checked and updated
5. Profile displayed with statistics and badges

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Image format validation
*For any* file upload, the system should accept files with MIME types 'image/jpeg', 'image/png', or 'image/webp' and reject all other file types
**Validates: Requirements 1.2**

### Property 2: AI autofill completeness
*For any* valid image upload, the extracted metadata should contain all required fields: suggestedName, category, color, and occasion array
**Validates: Requirements 1.2**

### Property 3: Manual entry creation
*For any* manual entry data containing all required fields (name, category, color), submitting should create a valid wardrobe item with aiExtracted set to false
**Validates: Requirements 1.3**

### Property 4: Item creation with required fields
*For any* add to closet action with all required fields completed, a new wardrobe item should be created with a unique ID and saved to storage
**Validates: Requirements 1.4**

### Property 5: Item card display completeness
*For any* wardrobe item displayed as a card, the card should show favorite heart icon, image (if available), item name, category, last worn date, and cost per wear
**Validates: Requirements 2.2**

### Property 6: Category filter correctness
*For any* category filter selection, all displayed items should have a category field matching the selected filter
**Validates: Requirements 2.3**

### Property 7: Search query matching
*For any* search query, all displayed items should have the query string appearing in their name, category, or color fields (case-insensitive)
**Validates: Requirements 2.4**

### Property 8: Favorite toggle persistence
*For any* item, clicking the heart icon should toggle the isFavorite field and persist the change to storage
**Validates: Requirements 2.5**

### Property 9: Chat greeting display
*For any* AI Stylist chat opening, the first message should be the greeting "Hi! I'm your personal AI stylist. I can help you pick the perfect outfit for any occasion. Just tell me what you need!"
**Validates: Requirements 3.1**

### Property 10: Outfit category diversity
*For any* generated outfit, it should contain items from at least 2 different complementary categories
**Validates: Requirements 3.4**

### Property 11: Outfit reasoning presence
*For any* outfit recommendation, the response should include an explanation of why specific items were chosen
**Validates: Requirements 3.5**

### Property 12: Profile statistics accuracy
*For any* wardrobe state, the profile should correctly display total items count, favorites count (items where isFavorite=true), and category breakdown summing to total items
**Validates: Requirements 4.1**

### Property 13: Style insights completeness
*For any* profile view, the style insights should include favorite style, most loved pieces, color preference, and style score percentage
**Validates: Requirements 4.2**

### Property 14: Wardrobe breakdown completeness
*For any* profile view, the wardrobe breakdown should include counts for all six categories: tops, bottoms, outerwear, dresses, shoes, and accessories
**Validates: Requirements 4.3**

### Property 15: Last worn date update
*For any* item marked as worn, the lastWorn field should be updated to the current date in ISO format
**Validates: Requirements 5.1**

### Property 16: Usage count increment
*For any* item marked as worn, the usageCount field should be incremented by exactly 1
**Validates: Requirements 5.2**

### Property 17: Cost per wear calculation
*For any* item with priceSGD > 0 and usageCount > 0, the displayed cost per wear should equal priceSGD divided by usageCount
**Validates: Requirements 5.4**

### Property 18: Most loved pieces identification
*For any* wardrobe with usage data, the most loved pieces should be the items with the highest usageCount values
**Validates: Requirements 5.5**

### Property 19: Occasion filter compliance
*For any* occasion mentioned in a chat message, all items in returned outfits should have that occasion in their occasion array
**Validates: Requirements 6.1**

### Property 20: Color coordination consideration
*For any* two outfits where one has harmonious color combinations and the other has clashing colors, the AI Stylist should prioritize the harmonious outfit
**Validates: Requirements 6.4**

### Property 21: Storage persistence round-trip
*For any* wardrobe item, saving it to storage and then loading from storage should return an equivalent item with all fields preserved
**Validates: Requirements 7.1, 7.2**

### Property 22: Profile statistics persistence
*For any* profile statistics, after saving and reloading the application, the favorite style, color preference, and style score should be preserved
**Validates: Requirements 7.5**

### Property 23: Deletion completeness
*For any* wardrobe item, after deletion, the item should not appear in subsequent storage queries and all related statistics should be recalculated
**Validates: Requirements 7.4**

### Property 24: Tab state preservation
*For any* tab switch, returning to the previous tab should preserve the scroll position, active filters, and search query
**Validates: Requirements 8.4**

### Property 25: Active tab indication
*For any* tab selection, the UI should visually indicate which tab is currently active
**Validates: Requirements 8.5**

### Property 26: Small wardrobe handling
*For any* wardrobe with fewer than 3 items, the AI Stylist should still generate recommendations using available items
**Validates: Requirements 9.1**

### Property 27: Error message sanitization
*For any* processing error, the error message returned to the user should not contain stack traces, file paths, or other technical implementation details
**Validates: Requirements 9.3**

### Property 28: Timeout handling
*For any* AI request that exceeds the timeout threshold (5 seconds), the system should return either partial results or a timeout message rather than blocking indefinitely
**Validates: Requirements 9.4**

### Property 29: Graceful AI service degradation
*For any* situation where the image recognition service is unavailable, the system should allow users to add items manually without AI autofill
**Validates: Requirements 9.5**


## Error Handling

### Error Categories

**Validation Errors (400):**
- Invalid file format
- Missing required fields
- Invalid filter values
- File size exceeds limit (5MB)

**Processing Errors (500):**
- AI service unavailable
- Metadata extraction failure
- Storage operation failure
- Chat processing timeout

**Not Found Errors (404):**
- Item ID not found

### Error Response Format

```typescript
interface ErrorResponse {
  error: string; // User-friendly message
  code: string; // Machine-readable error code
  details?: Record<string, any>; // Additional context (sanitized)
}
```

### Error Handling Strategy

1. **Graceful Degradation**: If AI service is unavailable, allow manual entry
2. **Retry Logic**: Retry failed AI requests up to 3 times with exponential backoff
3. **User Feedback**: Always provide actionable error messages
4. **Logging**: Log all errors server-side for debugging without exposing to client
5. **Fallback UI**: Show placeholder images when image URLs fail to load

## Testing Strategy

### Unit Testing

The system will use **Vitest** as the testing framework for unit tests. Unit tests will cover:

- **Utility Functions**: Color harmony rules, ID generation, date formatting
- **Validation Logic**: File type validation, required field checking, filter validation
- **Data Transformations**: Metadata to WardrobeItem conversion, profile calculations
- **Error Handling**: Error message sanitization, timeout handling
- **Storage Operations**: CRUD operations for items and profile

Example unit tests:
- Test that `calculateStyleProfile` correctly computes category breakdown
- Test that `validateImageFile` rejects invalid MIME types
- Test that `generateId` produces unique IDs
- Test that error messages don't contain sensitive information
- Test that `calculateCostPerWear` handles division by zero

### Property-Based Testing

The system will use **fast-check** as the property-based testing library for TypeScript. Property-based tests will verify universal properties across randomly generated inputs.

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Tagging Convention**: Each property-based test will include a comment tag in the format:
`// Feature: ai-outfit-recommendations, Property {number}: {property description}`

**Property Test Coverage**:
- Each correctness property listed above will be implemented as a single property-based test
- Tests will use smart generators that constrain inputs to valid ranges (e.g., valid MIME types, valid categories)
- Tests will verify properties hold across diverse inputs without mocking where possible

Example property tests:
- Generate random wardrobes and verify profile statistics sum correctly
- Generate random filter combinations and verify all results satisfy filters
- Generate random items and verify storage round-trip preserves all fields
- Generate random occasions and verify outfit filtering works correctly

### Integration Testing

Integration tests will verify:
- End-to-end image upload flow with mocked AI service
- Chat flow with real wardrobe data
- Storage persistence across page reloads
- Tab navigation state preservation
- API endpoint request/response contracts

### Test Data Generators

Custom generators for property-based testing:

```typescript
// Generate valid wardrobe items
const arbWardrobeItem = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  category: fc.constantFrom('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'),
  color: fc.constantFrom('White', 'Black', 'Navy Blue', 'Red', 'Grey', 'Blue', 'Brown'),
  colorHex: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
  occasion: fc.array(fc.constantFrom('casual', 'formal', 'work', 'sporty', 'business'), { minLength: 1, maxLength: 3 }),
  priceSGD: fc.option(fc.float({ min: 10, max: 500 })),
  usageCount: fc.nat({ max: 100 }),
  isFavorite: fc.boolean(),
  aiExtracted: fc.boolean(),
  createdAt: fc.date().map(d => d.toISOString()),
});

// Generate valid image files
const arbImageFile = fc.constantFrom('image/jpeg', 'image/png', 'image/webp')
  .map(mimeType => new File([''], 'test.jpg', { type: mimeType }));

// Generate chat requests
const arbChatRequest = fc.record({
  message: fc.string({ minLength: 5, maxLength: 200 }),
  wardrobeItems: fc.array(arbWardrobeItem, { minLength: 0, maxLength: 20 }),
});
```

## Performance Considerations

### Optimization Strategies

1. **Caching**: Cache AI metadata responses for identical images (using image hash)
2. **Lazy Loading**: Load wardrobe items in batches for large collections (virtualized scrolling)
3. **Debouncing**: Debounce search input to reduce filtering computation (300ms delay)
4. **Memoization**: Memoize expensive calculations like profile statistics
5. **Image Optimization**: Compress and resize uploaded images before storage

### Performance Targets

- Image upload and metadata extraction: < 3 seconds
- Chat response generation: < 2 seconds for wardrobes up to 100 items
- Profile statistics computation: < 500ms for wardrobes up to 100 items
- Storage operations: < 100ms
- Search/filter response: < 200ms

## Security Considerations

1. **File Upload Validation**: Strict MIME type and file size limits (max 5MB)
2. **API Rate Limiting**: Limit requests to prevent abuse (10 requests per minute per user)
3. **Input Sanitization**: Sanitize all user inputs to prevent XSS
4. **API Key Protection**: Store Hugging Face API key in environment variables, never expose to client
5. **Error Message Sanitization**: Never expose stack traces or internal paths
6. **LocalStorage Encryption**: Consider encrypting sensitive data in LocalStorage

## UI/UX Specifications

### My Closet View

**Header:**
- Title: "My Digital Closet" (top left)
- Add button: "+" icon (top right)

**Search Bar:**
- Placeholder: "Search by name, category, or color"
- Debounced input (300ms)

**Category Filters:**
- Horizontal scrollable row
- Options: All, Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories
- Active filter highlighted with accent color

**Item Cards:**
- Two-column grid layout
- Card contents (top to bottom):
  - Heart icon (top left corner) - toggles favorite
  - Clothing image (or placeholder if no image)
  - Item name (truncated if too long)
  - Category badge
  - Last Worn: [date or "Never"]
  - Cost per wear: $[amount] SGD (if price available)

### Profile View

**Statistics Section:**
- 2x2 grid showing:
  - Items in Closet
  - Favorite Pieces
  - Events Planned
  - Outfits Ready

**Style Insights:**
- Favorite Style with icon
- Most loved pieces with description
- Color Preference with color swatch
- Style Score with percentage

**Wardrobe Breakdown:**
- List of categories with counts
- Visual progress bars showing distribution

**Achievements:**
- Grid of achievement badges
- Unlocked badges in color, locked in grayscale

**Settings:**
- List of setting options (Notifications, Style Analytics, Achievements)

### AI Stylist Chatbot

**Floating Button:**
- Position: Bottom right corner
- Icon: Chat bubble or sparkle icon
- Pulsing animation to draw attention

**Chat Interface:**
- Full-screen modal overlay
- Header with "AI Stylist" title and close button
- Scrollable message area
- Input field at bottom with send button
- Quick action chips below greeting message

**Message Display:**
- User messages: Right-aligned, accent color background
- Assistant messages: Left-aligned, neutral background
- Outfit recommendations: Card-based layout with images

### Add Item Modal

**Layout:**
- Centered modal with backdrop
- Close button (top right)
- Image upload area (drag & drop or click to browse)
- Form fields:
  - Item Name (text input)
  - Category (dropdown)
  - Color (color picker + text input)
  - Occasion (multi-select chips)
  - Price in SGD (number input)
- "Add to Closet" button (bottom, full width)

## Future Enhancements

1. **Social Features**: Share outfits with friends, community voting
2. **Weather Integration**: Automatic weather-based recommendations using location
3. **Calendar Integration**: Outfit planning for upcoming events
4. **Virtual Try-On**: AR-based outfit visualization using device camera
5. **Sustainability Metrics**: Track environmental impact and cost savings
6. **Multi-User Support**: Family wardrobe sharing and management
7. **Outfit History**: Track and visualize what you wore each day
8. **Shopping List**: Generate shopping recommendations based on wardrobe gaps
9. **Laundry Tracker**: Track when items need cleaning
10. **Seasonal Storage**: Mark items as in/out of season for better organization
