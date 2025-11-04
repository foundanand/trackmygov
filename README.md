# TrackMyGov - Civic Transparency Platform

> **Making Government Accountable Through Community-Driven Issue Tracking**

TrackMyGov is a civic technology platform designed to empower Indian citizens to report, track, and verify civic issues at a granular level (state → city → area). Our mission is to create transparency and accountability in governance by crowdsourcing civic problems and tracking government responses.

## 🎯 The Vision

### The Problem
- Citizens face countless civic issues: corruption, potholes, water problems, domestic violence, poor sanitation, etc.
- No centralized way to track what issues exist where
- Government response times are unclear
- Citizens don't know if their complaints are being addressed
- No accountability mechanism for government departments

### Our Solution
A **Wikipedia-style platform for civic issues** where:
- **Citizens report issues** by simply clicking on a map
- **Community verification** through X-style Community Notes prevents fake reports
- **Real-time tracking** of government responses and resolution times
- **Data transparency** shows which areas/departments are most/least responsive
- **Historical trends** help citizens understand patterns and hold officials accountable

## 🗺️ How It Works

1. **Point & Report**: Click anywhere on India's map → red pin appears → auto-filled location details
2. **Describe Issue**: Add title, description, select category (corruption, infrastructure, safety, etc.)
3. **Community Verification**: Other citizens add context through community notes, rate authenticity
4. **Government Tracking**: Track official responses, resolution status, time taken
5. **Public Dashboard**: View issue statistics by state/city/department for accountability

## 🚀 Key Features

### Interactive Map
- **India-focused**: Map bounds restricted to India
- **Color-coded markers** by issue category
- **Click-to-report**: No manual coordinate entry
- **Real-time updates**: See new issues as they're reported

### Community Verification (Similar to X Community Notes)
- **Crowd-sourced validation** of reported issues
- **Rating system**: Helpful/Partially Helpful/Not Helpful
- **Prevents spam** and maintains data quality
- **Builds trust** through community consensus

### Granular Location Tracking
- **Hierarchical data**: Country → State → City → Area → Pincode
- **Auto-geocoding**: Automatic address detection from coordinates
- **Reverse location lookup** via Google Maps API

### Government Accountability
- **Response tracking**: Monitor official acknowledgment and action
- **Resolution timelines**: Measure how quickly issues get resolved
- **Performance metrics**: Compare response rates across departments/areas
- **Historical data**: Track improvements or deterioration over time

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: tRPC, Node.js
- **Database**: PostgreSQL with PostGIS (geospatial support)
- **Maps**: Google Maps API with Places/Geocoding
- **ORM**: Prisma
- **Infrastructure**: Docker, T3 Stack

## 🏗️ Current Status

**✅ MVP Features Complete:**
- Interactive India map with click-to-report
- Issue reporting with auto-location detection
- Community Notes system for verification
- Basic filtering and display
- Mobile-optimized responsive design

**🚧 Coming Soon:**
- User authentication and profiles
- Government response tracking
- Issue detail pages with full community discussion
- Photo/video uploads for evidence
- Analytics dashboard with state/city comparisons
- Email notifications for issue updates
- Government department integration

## 🎯 Impact Goals

### For Citizens
- **Visibility**: See civic issues in their area and across India
- **Voice**: Easy way to report problems without bureaucratic hassle
- **Validation**: Community verification ensures authentic reporting
- **Tracking**: Monitor if their complaints are being addressed

### For Government
- **Real-time feedback**: Understand citizen priorities and pain points
- **Performance metrics**: Data-driven insights into department efficiency
- **Transparency**: Public dashboard showing response rates and resolution times
- **Accountability**: Citizens can track promises vs. actual action

### For Society
- **Data-driven activism**: Evidence-based advocacy for policy changes
- **Regional comparisons**: Learn from well-performing areas
- **Historical trends**: Track progress (or lack thereof) over time
- **Democratic participation**: Increased civic engagement through technology

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

```bash
# 1. Start database
bash start-database.sh

# 2. Push schema
pnpm db:push

# 3. Add Google Maps API key to .env
# 4. Start development server
pnpm dev
```

## 🤝 Contributing

This is an open-source civic tech project. We welcome contributions from developers, designers, and civic activists who want to help build a more transparent and accountable democracy.

### Areas where we need help:
- Government API integrations
- Mobile app development
- Data visualization and analytics
- UX/UI improvements
- Content moderation systems
- Multi-language support

## 📊 Data Model

**Issues**: Location-tagged civic complaints with category, status, and community verification
**Community Notes**: Wikipedia-style collaborative verification system
**Government Responses**: Official acknowledgments and actions taken
**Analytics**: Aggregated data for transparency and accountability metrics

---

**Built with love for India's digital democracy** 🇮🇳

*"Transparency is the cornerstone of accountability, and accountability is the foundation of good governance."*
