# **App Name**: Barkive MVP

## Core Features:

- Pet Profile Management: Enable the creation and management of pet profiles, including name, breed, age, weight, and avatar. Store structured pet data with subcollections for feeding, activity, health, and memories in Firestore. Store pet memory photos in Firebase Storage.
- Dashboard Visualization: Visually appealing display of pet data with charts and summaries in a friendly dashboard.
- Personalized Care Tips: Use an LLM tool to provide custom care recommendations based on uploaded pet information. Make use of breed, age and weight to influence recommendations.
- Memory Journaling: Enable users to record text-based journal entries for notable experiences. Memory journaling should feel like instagram.
- Meal Completion Tracker: Meal Completion Tracker component to the Barkive dashboard. Displays three soft pastel circles labeled Breakfast, Lunch, and Dinner, each with a bowl (🥣) icon. The circles fill in automatically based on the current day’s feeding logs stored in Firestore. Feeding logs contain a timestamp, and the system should categorize them by time of day. Breakfast: 4:00 AM – 10:59 AM. Lunch: 11:00 AM – 3:59 PM. Dinner: 4:00 PM – 9:59 PM. When a feeding entry is recorded in the matching time range, the corresponding circle should fill with a pastel color (e.g. #FAD3D3, #D7EAD9, #E5D4EF). If not fed, it stays gray. Use Firestore to fetch all feeding logs from today only (users/{uid}/pets/{petId}/feeding) and determine which meals were completed. Display the tracker in a card layout with rounded corners, and optionally show the last logged time below each icon. Each circle must animate softly when filled. Icons should be centered and readable
- Pet Album Carousel: Pet Album Carousel to the Barkive dashboard. This component displays the 10 most recent pet memory photos uploaded by the user. Each photo is stored in Firebase Storage, with a caption and timestamp saved in Firestore (users/{uid}/pets/{petId}/memories). Display each memory in a rounded card with a thumbnail and short caption. Make the carousel horizontally scrollable with smooth snapping behavior. Style it with soft shadows, padding, and pastel accents. Images must auto-load and be sorted by most recent.
- Weekly Activity Tracker: Add a weekly activity tracker to the Barkive dashboard that visually represents pet movement using paw print icons. Display 7 paw icons, one for each day of the week. When a pet has activity logged on a given day, the paw icon should fill with color or glow to represent completed activity. Use data from Firestore (users/{uid}/pets/{petId}/activity) and group logs by day. If a day has zero activity, show the paw as gray. Animate paw icons to “stamp” in when new activity is logged. Style the component with soft spacing, rounded edges, and pastel colors. Match the Barkive UI. Optionally show a badge or animation if 5+ days have been completed in the current week.

## Style Guidelines:

- Background: #FDFBF7
- Primary accent: #D7EAD9 (mint green)
- Secondary accent: #FAD3D3 (coral blush)
- Tertiary accent: #EADDF5 (lavender)
- Inactive or neutral: #E5E7EB (gray-100)
- rounded-2xl corner radius
- Soft drop shadows (shadow-md or shadow-lg)
- Spacious padding (p-4, gap-4)
- Grid or flex-based responsiveness
- Ensure large interactive targets on mobile (min-w-[56px] min-h-[56px])
- Font: 'Nunito', a warm, friendly sans-serif
- Headings: text-xl to text-2xl, font-semibold
- Body: text-sm to text-base, font-normal
- Text color: text-gray-700 for body, text-gray-900 for headers
- Use Lucide.dev or Tabler Icons
- Icon style: rounded, minimal, soft-lined
- Use filled icons for completed states (e.g., paw-print filled)
- No emojis — icons only
- Buttons: hover:scale-105, transition-transform
- Cards: transition-opacity and shadow
- Paw Tracker: custom @keyframes stamp for icon entrance
- Rewards: glow or wiggle on streaks/badges