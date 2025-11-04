# TrackMyGov - Setup Guide

## Quick Start

### 1. Install Dependencies
All dependencies are already installed via `pnpm install`.

### 2. Database Setup
```bash
# Start PostgreSQL container
bash start-database.sh

# Push Prisma schema to database
pnpm db:push
```

### 3. Environment Variables
Update `.env` with your Google Maps API key:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
DATABASE_URL=postgresql://postgres:password@localhost:5432/trackmygov
```

**Get API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Maps API
4. Create an API key with restrictions for your domain
5. Add to `.env`

### 4. Run Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000` to see your app.

## Workflow

1. **View Map**: Shows all reported issues across India
2. **Click on Map**: Red pin appears at clicked location
3. **Fill Details**: Modal opens with auto-filled location info (city, state, etc.)
4. **Submit**: Issue is saved and marker appears on map
5. **View Details**: Click any marker to see issue and community notes

## Key Features

### Map Interface
- Restricted to India bounds
- Color-coded markers by issue category
- Click to place temporary red pin
- Info windows show issue preview

### Issue Reporting
- Click → Auto-geocoded location info
- No manual lat/lng entry
- Quick form: Title + Description + Category
- Real-time state/city detection

### Community Notes
- Similar to X Community Notes
- Rate notes as Helpful/Partially Helpful/Not Helpful
- Notes sorted by rating
- Count tracking for each rating

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: tRPC, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Maps**: Google Maps API
- **Forms**: Zod validation

## Project Structure

```
src/
├── app/
│   ├── _components/
│   │   ├── Map.tsx              # Interactive India map
│   │   ├── IssueModal.tsx       # Click-to-report modal
│   │   ├── CommunityNotes.tsx   # Community verification
│   │   └── CreateIssueForm.tsx  # Old form (deprecated)
│   ├── api/
│   │   └── trpc/                # tRPC API route
│   ├── page.tsx                 # Homepage
│   └── layout.tsx
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── issue.ts         # Issue CRUD operations
│   │   │   └── communityNote.ts # Community notes CRUD
│   │   ├── trpc.ts              # tRPC config
│   │   └── root.ts              # Router aggregation
│   └── db.ts                     # Database client
└── trpc/
    ├── react.tsx                # Client hooks
    └── server.ts                # Server calls
```

## Database Schema

### Issue
- id, title, description, category, status
- latitude, longitude (exact location)
- state, city, area, pincode (reverse geocoded)
- createdBy, createdAt, updatedAt
- upvotes count

### CommunityNote
- id, content, issueId
- helpful, notHelpful counts
- rating (HELPFUL, PARTIALLY_HELPFUL, NOT_HELPFUL)
- createdBy, createdAt, updatedAt

### IssueUpvote
- Tracks unique user upvotes per issue

## API Routes (tRPC)

### Issues
- `issue.create` - Report new issue
- `issue.getById` - Get issue with community notes
- `issue.listByBounds` - Get issues in map viewport
- `issue.listByLocation` - Filter by state/city/category
- `issue.upvote` - Toggle upvote
- `issue.updateStatus` - Change issue status

### Community Notes
- `communityNote.create` - Add verification note
- `communityNote.getByIssue` - Get all notes for issue
- `communityNote.rate` - Rate note's helpfulness
- `communityNote.delete` - Remove note (owner only)

## Next Steps

1. **User Authentication**: Add NextAuth/Supabase Auth
2. **Issue Detail Page**: Full issue view with full community notes
3. **Photo Uploads**: Integrate with Cloudinary/S3
4. **Admin Dashboard**: Government response tracking
5. **Analytics**: Issue statistics by state/category
6. **Notifications**: Email/SMS for issue updates

## Troubleshooting

### Database Connection Issues
```bash
# Check Docker is running
docker ps

# Restart database
bash start-database.sh
```

### Google Maps Not Loading
- Ensure API key is in `.env`
- API key has Maps JavaScript API enabled
- Check browser console for errors

### Build Errors
```bash
# Clean and rebuild
rm -rf .next
pnpm build
```
