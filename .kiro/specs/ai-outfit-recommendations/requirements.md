# Requirements Document

## Introduction

FitPrint is an AI-powered digital wardrobe and styling platform that helps users manage their clothing inventory and receive personalized outfit recommendations. This feature enables users to upload clothing images or manually input items, which the system then uses to generate AI-driven outfit suggestions based on their wardrobe contents, style preferences, and contextual factors.

## Glossary

- **FitPrint System**: The complete digital wardrobe and styling platform
- **Digital Closet**: The main view displaying all wardrobe items in a card-based grid layout
- **Wardrobe Item**: A single piece of clothing stored in the user's digital wardrobe
- **Outfit Recommendation**: A curated combination of wardrobe items suggested by the AI
- **AI Stylist**: The conversational chatbot interface that provides personalized outfit recommendations
- **Clothing Metadata**: Structured information about a wardrobe item including category, color, occasion, and price
- **User Profile**: Collection of user preferences, statistics, and style insights
- **Style Score**: A percentage value representing outfit coordination quality
- **Cost Per Wear**: The purchase price divided by the number of times an item has been worn
- **Favorite Item**: A wardrobe item marked with a heart icon for quick access

## Requirements

### Requirement 1

**User Story:** As a user, I want to add clothing items through a modal dialog, so that I can quickly build my digital wardrobe with or without photos.

#### Acceptance Criteria

1. WHEN a user clicks the add button THEN the FitPrint System SHALL display a modal with fields for image upload, item name, category, color, occasion, and price in SGD
2. WHEN a user uploads an image THEN the FitPrint System SHALL accept common image formats (JPEG, PNG, WebP) and autofill item name, category, color, and occasion
3. WHEN a user chooses manual entry THEN the FitPrint System SHALL allow direct input of all fields without requiring an image
4. WHEN a user clicks add to closet with all required fields completed THEN the FitPrint System SHALL create a new wardrobe item and close the modal
5. IF an uploaded image does not contain recognizable clothing THEN the FitPrint System SHALL notify the user and allow manual field entry

### Requirement 2

**User Story:** As a user, I want to view and filter my clothing items in a card-based grid, so that I can easily browse and manage my digital closet.

#### Acceptance Criteria

1. WHEN a user views the Digital Closet THEN the FitPrint System SHALL display items in a two-column grid with scrollable rows
2. WHEN displaying an item card THEN the FitPrint System SHALL show a favorite heart icon, clothing image, item name, category, last worn date, and cost per wear
3. WHEN a user clicks a category filter THEN the FitPrint System SHALL display only items matching that category
4. WHEN a user types in the search bar THEN the FitPrint System SHALL filter items by name, category, or color matching the search query
5. WHEN a user clicks the heart icon on an item card THEN the FitPrint System SHALL toggle the favorite status for that item

### Requirement 3

**User Story:** As a user, I want to interact with an AI Stylist chatbot, so that I can get personalized outfit recommendations through natural conversation.

#### Acceptance Criteria

1. WHEN a user clicks the AI Stylist button THEN the FitPrint System SHALL open a chat interface with the greeting message "Hi! I'm your personal AI stylist. I can help you pick the perfect outfit for any occasion. Just tell me what you need!"
2. WHEN the chat interface opens THEN the FitPrint System SHALL display default quick-action options for common requests
3. WHEN a user sends a message to the AI Stylist THEN the AI Stylist SHALL generate outfit recommendations based on the user's request and available wardrobe items
4. WHEN generating recommendations THEN the AI Stylist SHALL ensure each outfit includes items from complementary categories
5. WHEN displaying recommendations THEN the AI Stylist SHALL present outfits with images, item names, and styling reasoning

### Requirement 4

**User Story:** As a user, I want to view my style profile and wardrobe statistics, so that I can understand my fashion preferences and wearing patterns.

#### Acceptance Criteria

1. WHEN a user navigates to the Profile tab THEN the FitPrint System SHALL display statistics including items in closet, favorite pieces, events planned, and outfits ready
2. WHEN displaying style insights THEN the FitPrint System SHALL show favorite style, most loved pieces, color preference, and style score percentage
3. WHEN displaying wardrobe breakdown THEN the FitPrint System SHALL show item counts for each category (Tops, Bottoms, Outerwear, Dresses, Shoes, Accessories)
4. WHEN displaying achievements THEN the FitPrint System SHALL show earned badges such as Style Master, Event Planner, and Trendsetter
5. WHEN a user accesses settings THEN the FitPrint System SHALL provide options for notifications, style analytics, and achievements

### Requirement 5

**User Story:** As a user, I want the app to track when I wear items, so that I can see usage statistics and cost per wear calculations.

#### Acceptance Criteria

1. WHEN a user marks an item as worn THEN the FitPrint System SHALL update the last worn date to the current date
2. WHEN an item is marked as worn THEN the FitPrint System SHALL increment the usage count for that item
3. WHEN displaying an item card THEN the FitPrint System SHALL show the last worn date in a readable format
4. WHEN an item has a purchase price and usage count greater than zero THEN the FitPrint System SHALL calculate and display cost per wear as price divided by usage count
5. WHEN calculating style insights THEN the FitPrint System SHALL identify most loved pieces based on usage frequency

### Requirement 6

**User Story:** As a user, I want the AI Stylist to understand context from my requests, so that I receive relevant outfit suggestions for specific occasions.

#### Acceptance Criteria

1. WHEN a user mentions an occasion in the chat THEN the AI Stylist SHALL filter recommendations to items tagged with that occasion
2. WHEN a user requests outfits for multiple occasions THEN the AI Stylist SHALL generate separate recommendations for each occasion
3. WHEN no items match the requested occasion THEN the AI Stylist SHALL notify the user and suggest adding appropriate items
4. WHEN generating recommendations THEN the AI Stylist SHALL consider color coordination and style compatibility between items
5. WHEN displaying recommendations THEN the AI Stylist SHALL explain why specific items were chosen for the outfit

### Requirement 7

**User Story:** As a user, I want my wardrobe data and preferences to persist across sessions, so that I don't lose my clothing inventory and style profile.

#### Acceptance Criteria

1. WHEN a user adds or modifies a wardrobe item THEN the FitPrint System SHALL persist the changes to storage immediately
2. WHEN a user returns to the application THEN the FitPrint System SHALL load all previously saved wardrobe items, favorites, and profile statistics
3. WHEN storage operations fail THEN the FitPrint System SHALL notify the user and prevent data loss by maintaining the current session state
4. WHEN a user deletes a wardrobe item THEN the FitPrint System SHALL remove it from storage and update all related statistics immediately
5. WHEN profile statistics change THEN the FitPrint System SHALL recalculate and persist favorite style, color preference, and style score

### Requirement 8

**User Story:** As a user, I want to navigate between My Closet and Profile tabs, so that I can access different features of the application.

#### Acceptance Criteria

1. WHEN a user views the application THEN the FitPrint System SHALL display a bottom navigation bar with My Closet and Profile tabs
2. WHEN a user clicks the My Closet tab THEN the FitPrint System SHALL display the Digital Closet view with search, filters, and item cards
3. WHEN a user clicks the Profile tab THEN the FitPrint System SHALL display the style profile with statistics, insights, and achievements
4. WHEN switching tabs THEN the FitPrint System SHALL preserve the state of each tab (scroll position, filters, search query)
5. WHEN a tab is active THEN the FitPrint System SHALL visually indicate which tab is currently selected

### Requirement 9

**User Story:** As a system administrator, I want the AI systems to handle edge cases gracefully, so that users receive a reliable experience regardless of their wardrobe size or composition.

#### Acceptance Criteria

1. WHEN a user has fewer than three items in their wardrobe THEN the AI Stylist SHALL generate recommendations using available items without requiring minimum thresholds
2. WHEN a user's wardrobe contains items from only one category THEN the AI Stylist SHALL notify the user and suggest adding items from other categories
3. WHEN the AI Stylist encounters processing errors THEN the FitPrint System SHALL log the error and display a user-friendly message without exposing technical details
4. WHEN recommendation generation exceeds timeout thresholds THEN the FitPrint System SHALL return partial results or a timeout message rather than blocking indefinitely
5. WHEN the image recognition service is unavailable THEN the FitPrint System SHALL allow users to add items manually without AI autofill
