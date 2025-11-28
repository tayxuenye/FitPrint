# Implementation Plan

- [ ] 1. Update type definitions and data models
  - Update WardrobeItem interface to include new fields (isFavorite, occasion array, priceSGD, dresses category)
  - Create StyleProfile, Achievement, ChatMessage, ImageMetadata, ChatRequest, and ChatResponse interfaces
  - Remove old Outfit interface fields and update with new structure
  - _Requirements: 1.1, 2.2, 4.1_

- [ ] 1.1 Write property test for type definitions
  - **Property 1: Image format validation**
  - **Validates: Requirements 1.2**

- [ ] 2. Implement storage service with new schema
  - Update LocalStorage keys to match new schema (fitprint:wardrobe:items, fitprint:profile, fitprint:chat:history)
  - Implement saveItem, getItems, updateItem, deleteItem functions
  - Implement toggleFavorite and markAsWorn functions
  - Implement getProfile and saveProfile functions
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 2.1 Write property test for storage persistence
  - **Property 21: Storage persistence round-trip**
  - **Validates: Requirements 7.1, 7.2**

- [ ] 2.2 Write property test for deletion
  - **Property 23: Deletion completeness**
  - **Validates: Requirements 7.4**

- [ ] 3. Create My Closet page layout and header
  - Implement "My Digital Closet" header with add button in top right
  - Create search bar component with debounced input
  - Implement category filter row (All, Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories)
  - Set up two-column grid layout for item cards
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 3.1 Write property test for category filtering
  - **Property 6: Category filter correctness**
  - **Validates: Requirements 2.3**

- [ ] 3.2 Write property test for search functionality
  - **Property 7: Search query matching**
  - **Validates: Requirements 2.4**

- [ ] 4. Implement wardrobe item card component
  - Create card layout with favorite heart icon, image, name, category, last worn, and cost per wear
  - Implement favorite toggle functionality
  - Handle missing images with placeholder
  - Calculate and display cost per wear
  - _Requirements: 2.2, 2.5, 5.3, 5.4_

- [ ] 4.1 Write property test for favorite toggle
  - **Property 8: Favorite toggle persistence**
  - **Validates: Requirements 2.5**

- [ ] 4.2 Write property test for cost per wear calculation
  - **Property 17: Cost per wear calculation**
  - **Validates: Requirements 5.4**

- [ ] 4.3 Write property test for card display completeness
  - **Property 5: Item card display completeness**
  - **Validates: Requirements 2.2**

- [ ] 5. Create add item modal component
  - Implement modal with image upload area (drag & drop and click to browse)
  - Create form fields for name, category, color, occasion (multi-select), and price in SGD
  - Implement file validation (JPEG, PNG, WebP, max 5MB)
  - Add "Add to Closet" button
  - _Requirements: 1.1, 1.3, 1.4_

- [ ] 5.1 Write property test for manual entry creation
  - **Property 3: Manual entry creation**
  - **Validates: Requirements 1.3**

- [ ] 5.2 Write property test for item creation
  - **Property 4: Item creation with required fields**
  - **Validates: Requirements 1.4**

- [ ] 6. Implement image upload API endpoint
  - Create /api/upload route
  - Integrate with Hugging Face Vision API for metadata extraction
  - Return autofilled metadata (name, category, color, occasion)
  - Handle errors gracefully when AI service is unavailable
  - _Requirements: 1.2, 9.5_

- [ ] 6.1 Write property test for AI autofill
  - **Property 2: AI autofill completeness**
  - **Validates: Requirements 1.2**

- [ ] 6.2 Write property test for graceful degradation
  - **Property 29: Graceful AI service degradation**
  - **Validates: Requirements 9.5**

- [ ] 7. Implement Profile Analytics Service
  - Create calculateStyleProfile function
  - Implement determineFavoriteStyle (most common occasion)
  - Implement getColorPreference (most common color)
  - Implement calculateStyleScore (outfit coordination potential)
  - Implement getMostLovedPieces (highest usage count)
  - Create wardrobe breakdown calculation by category
  - _Requirements: 4.1, 4.2, 4.3, 5.5_

- [ ] 7.1 Write property test for profile statistics
  - **Property 12: Profile statistics accuracy**
  - **Validates: Requirements 4.1**

- [ ] 7.2 Write property test for style insights
  - **Property 13: Style insights completeness**
  - **Validates: Requirements 4.2**

- [ ] 7.3 Write property test for wardrobe breakdown
  - **Property 14: Wardrobe breakdown completeness**
  - **Validates: Requirements 4.3**

- [ ] 7.4 Write property test for most loved pieces
  - **Property 18: Most loved pieces identification**
  - **Validates: Requirements 5.5**

- [ ] 8. Create Profile page layout
  - Implement statistics section (2x2 grid: items, favorites, events, outfits)
  - Create style insights section (favorite style, most loved pieces, color preference, style score)
  - Implement wardrobe breakdown with category counts
  - Create achievements section with badge grid
  - Add settings section
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8.1 Write property test for profile persistence
  - **Property 22: Profile statistics persistence**
  - **Validates: Requirements 7.5**

- [ ] 9. Implement mark as worn functionality
  - Add UI control to mark items as worn
  - Update lastWorn date to current date
  - Increment usageCount by 1
  - Recalculate profile statistics
  - _Requirements: 5.1, 5.2_

- [ ] 9.1 Write property test for last worn update
  - **Property 15: Last worn date update**
  - **Validates: Requirements 5.1**

- [ ] 9.2 Write property test for usage count
  - **Property 16: Usage count increment**
  - **Validates: Requirements 5.2**

- [ ] 10. Create AI Stylist chatbot UI
  - Implement floating button in bottom right corner
  - Create full-screen chat modal with header and close button
  - Display greeting message on open
  - Add quick action chips for common requests
  - Implement message display (user right-aligned, assistant left-aligned)
  - Create input field with send button
  - _Requirements: 3.1, 3.2_

- [ ] 10.1 Write property test for chat greeting
  - **Property 9: Chat greeting display**
  - **Validates: Requirements 3.1**

- [ ] 11. Implement AI Stylist Engine
  - Create parseUserIntent function to extract occasion from messages
  - Implement generateOutfits function with color harmony rules
  - Ensure outfits have items from complementary categories
  - Generate reasoning for each outfit recommendation
  - Filter items by occasion when mentioned
  - _Requirements: 3.3, 3.4, 3.5, 6.1, 6.4, 6.5_

- [ ] 11.1 Write property test for outfit category diversity
  - **Property 10: Outfit category diversity**
  - **Validates: Requirements 3.4**

- [ ] 11.2 Write property test for outfit reasoning
  - **Property 11: Outfit reasoning presence**
  - **Validates: Requirements 3.5**

- [ ] 11.3 Write property test for occasion filtering
  - **Property 19: Occasion filter compliance**
  - **Validates: Requirements 6.1**

- [ ] 11.4 Write property test for color coordination
  - **Property 20: Color coordination consideration**
  - **Validates: Requirements 6.4**

- [ ] 11.5 Write property test for small wardrobes
  - **Property 26: Small wardrobe handling**
  - **Validates: Requirements 9.1**

- [ ] 12. Create chat API endpoint
  - Implement /api/chat route
  - Process incoming chat messages
  - Call AI Stylist Engine to generate recommendations
  - Return chat response with outfits and reasoning
  - Handle timeouts gracefully (5 second limit)
  - _Requirements: 3.3, 6.2, 6.3, 9.4_

- [ ] 12.1 Write property test for timeout handling
  - **Property 28: Timeout handling**
  - **Validates: Requirements 9.4**

- [ ] 13. Implement bottom navigation
  - Create two-tab navigation (My Closet, Profile)
  - Implement tab switching with visual indication
  - Preserve tab state (scroll position, filters, search query)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13.1 Write property test for tab state preservation
  - **Property 24: Tab state preservation**
  - **Validates: Requirements 8.4**

- [ ] 13.2 Write property test for active tab indication
  - **Property 25: Active tab indication**
  - **Validates: Requirements 8.5**

- [ ] 14. Implement error handling and sanitization
  - Create error message sanitization utility
  - Ensure no stack traces or file paths in user-facing errors
  - Add user-friendly error messages for all error cases
  - Implement retry logic for AI service failures
  - _Requirements: 9.3_

- [ ] 14.1 Write property test for error sanitization
  - **Property 27: Error message sanitization**
  - **Validates: Requirements 9.3**

- [ ] 15. Add outfit display in chat
  - Create outfit card component for chat messages
  - Display outfit items with images
  - Show AI reasoning below outfit
  - Make outfits visually distinct from text messages
  - _Requirements: 3.5, 6.5_

- [ ] 16. Implement achievement system
  - Define achievement criteria (Style Master, Event Planner, Trendsetter)
  - Create checkAchievements function
  - Update achievements when profile changes
  - Display unlocked/locked badges in profile
  - _Requirements: 4.4_

- [ ] 17. Add image optimization
  - Compress uploaded images before storage
  - Resize images to appropriate dimensions
  - Generate thumbnails for card display
  - Handle image loading errors with placeholders
  - _Requirements: 1.2_

- [ ] 18. Implement caching for AI responses
  - Cache image metadata responses by image hash
  - Store cache in LocalStorage (fitprint:cache:metadata)
  - Implement cache expiration (7 days)
  - Reduce redundant API calls
  - _Requirements: 1.2_

- [ ] 19. Add loading states and animations
  - Show loading spinner during image upload
  - Display skeleton cards while loading wardrobe
  - Add loading indicator for chat responses
  - Implement smooth transitions for tab switching
  - _Requirements: 1.2, 3.3_

- [ ] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
