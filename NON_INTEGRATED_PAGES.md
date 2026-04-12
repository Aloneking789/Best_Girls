# Non-Integrated Pages - API Requirements

---

## 🏠 DASHBOARD API REQUIREMENTS

**Location:** `app/dashboard-client.tsx`

**Purpose:** Main dashboard with analytics, metrics, charts, and real-time data summaries

**Required API Endpoints:**
- `GET /dashboard/metrics` - Fetch dashboard metrics (admissions, leads, etc.)
- `GET /dashboard/trends` - Fetch activity trends data for charts
- `GET /dashboard/admission-status` - Fetch admission status breakdown
- `GET /dashboard/recent-admissions` - Fetch recent admissions list
- `GET /dashboard/recent-leads` - Fetch recent leads/inquiries
- `GET /dashboard/latest-notices` - Fetch latest notices

**Expected Data Structure:**
```typescript
DashboardMetrics {
  totalAdmissions: number
  pendingAdmissions: number
  totalLeads: number
  unreadLeads: number
  totalEvents: number
  totalFaculty: number
  totalStudents: number
}

ActivityTrend {
  month: string
  admissions: number
  leads: number
  events: number
}

AdmissionStatusBreakdown {
  approved: number
  pending: number
  rejected: number
  percentage: {
    approved: number
    pending: number
    rejected: number
  }
}

RecentAdmission {
  id: string
  name: string
  status: 'Approved' | 'Pending' | 'Rejected'
  date: string
  course: string
}

RecentLead {
  id: string
  name: string
  date: string
  read: boolean
  email: string
}

LatestNotice {
  id: string
  title: string
  type: 'Exam' | 'Announcement' | 'General'
  date: string
  priority: 'High' | 'Medium' | 'Low'
}

DashboardResponse {
  success: boolean
  data: {
    metrics: DashboardMetrics
    trends: ActivityTrend[]
    admissionStatus: AdmissionStatusBreakdown
    recentAdmissions: RecentAdmission[]
    recentLeads: RecentLead[]
    latestNotices: LatestNotice[]
  }
}
```

**Sample Complete API Response (Single Endpoint):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalAdmissions": 342,
      "pendingAdmissions": 28,
      "totalLeads": 156,
      "unreadLeads": 12,
      "totalEvents": 45,
      "totalFaculty": 85,
      "totalStudents": 2840
    },
    "trends": [
      {
        "month": "Jan",
        "admissions": 65,
        "leads": 45,
        "events": 28
      },
      {
        "month": "Feb",
        "admissions": 78,
        "leads": 52,
        "events": 35
      },
      {
        "month": "Mar",
        "admissions": 92,
        "leads": 68,
        "events": 42
      },
      {
        "month": "Apr",
        "admissions": 110,
        "leads": 85,
        "events": 55
      },
      {
        "month": "May",
        "admissions": 125,
        "leads": 95,
        "events": 62
      },
      {
        "month": "Jun",
        "admissions": 145,
        "leads": 115,
        "events": 78
      }
    ],
    "admissionStatus": {
      "approved": 45,
      "pending": 28,
      "rejected": 12,
      "colors": {
        "approved": "#10b981",
        "pending": "#f59e0b",
        "rejected": "#ef4444"
      }
    },
    "recentAdmissions": [
      {
        "id": "adm_1",
        "name": "John Smith",
        "status": "Approved",
        "date": "2024-04-10",
        "course": "B.Tech"
      },
      {
        "id": "adm_2",
        "name": "Sarah Johnson",
        "status": "Pending",
        "date": "2024-04-09",
        "course": "MBA"
      },
      {
        "id": "adm_3",
        "name": "Mike Davis",
        "status": "Approved",
        "date": "2024-04-08",
        "course": "B.Tech"
      },
      {
        "id": "adm_4",
        "name": "Emma Wilson",
        "status": "Pending",
        "date": "2024-04-07",
        "course": "M.Tech"
      },
      {
        "id": "adm_5",
        "name": "Alex Brown",
        "status": "Rejected",
        "date": "2024-04-06",
        "course": "PhD"
      }
    ],
    "recentLeads": [
      {
        "id": "lead_1",
        "name": "Lisa Anderson",
        "date": "2024-04-10",
        "read": false,
        "email": "lisa@example.com"
      },
      {
        "id": "lead_2",
        "name": "Tom Harris",
        "date": "2024-04-09",
        "read": true,
        "email": "tom@example.com"
      },
      {
        "id": "lead_3",
        "name": "Jessica Lee",
        "date": "2024-04-08",
        "read": false,
        "email": "jessica@example.com"
      },
      {
        "id": "lead_4",
        "name": "David Miller",
        "date": "2024-04-07",
        "read": true,
        "email": "david@example.com"
      }
    ],
    "latestNotices": [
      {
        "id": "notice_1",
        "title": "Exam Schedule Released",
        "type": "Exam",
        "date": "2024-04-10",
        "priority": "High",
        "typeColor": "bg-blue-100 text-blue-800"
      },
      {
        "id": "notice_2",
        "title": "Holiday Announcement",
        "type": "Announcement",
        "date": "2024-04-09",
        "priority": "Medium",
        "typeColor": "bg-purple-100 text-purple-800"
      },
      {
        "id": "notice_3",
        "title": "Admission Results Out",
        "type": "General",
        "date": "2024-04-08",
        "priority": "High",
        "typeColor": "bg-gray-100 text-gray-800"
      }
    ]
  },
  "timestamp": "2024-04-10T15:30:00Z"
}
```

**Alternative: Optimized Single Response (Recommended)**
```json
{
  "success": true,
  "data": {
    "dashboard": {
      "metrics": {
        "admissions": { "total": 342, "pending": 28, "trend": "up", "trendValue": 12 },
        "leads": { "total": 156, "unread": 12, "trend": "up", "trendValue": 8 },
        "events": { "total": 45, "trend": "neutral" },
        "faculty": { "total": 85, "trend": "up", "trendValue": 5 },
        "students": { "total": 2840, "trend": "up", "trendValue": 15 }
      },
      "charts": {
        "activityTrends": {
          "type": "line",
          "data": [
            { "month": "Jan", "admissions": 65, "leads": 45, "events": 28 },
            { "month": "Feb", "admissions": 78, "leads": 52, "events": 35 },
            { "month": "Mar", "admissions": 92, "leads": 68, "events": 42 },
            { "month": "Apr", "admissions": 110, "leads": 85, "events": 55 },
            { "month": "May", "admissions": 125, "leads": 95, "events": 62 },
            { "month": "Jun", "admissions": 145, "leads": 115, "events": 78 }
          ]
        },
        "admissionStatus": {
          "type": "pie",
          "data": [
            { "name": "Approved", "value": 45, "color": "#10b981" },
            { "name": "Pending", "value": 28, "color": "#f59e0b" },
            { "name": "Rejected", "value": 12, "color": "#ef4444" }
          ]
        }
      },
      "tables": {
        "recentAdmissions": [
          { "id": "adm_1", "name": "John Smith", "status": "Approved", "date": "2024-04-10", "course": "B.Tech" },
          { "id": "adm_2", "name": "Sarah Johnson", "status": "Pending", "date": "2024-04-09", "course": "MBA" },
          { "id": "adm_3", "name": "Mike Davis", "status": "Approved", "date": "2024-04-08", "course": "B.Tech" },
          { "id": "adm_4", "name": "Emma Wilson", "status": "Pending", "date": "2024-04-07", "course": "M.Tech" },
          { "id": "adm_5", "name": "Alex Brown", "status": "Rejected", "date": "2024-04-06", "course": "PhD" }
        ],
        "recentLeads": [
          { "id": "lead_1", "name": "Lisa Anderson", "date": "2024-04-10", "read": false, "email": "lisa@example.com" },
          { "id": "lead_2", "name": "Tom Harris", "date": "2024-04-09", "read": true, "email": "tom@example.com" },
          { "id": "lead_3", "name": "Jessica Lee", "date": "2024-04-08", "read": false, "email": "jessica@example.com" },
          { "id": "lead_4", "name": "David Miller", "date": "2024-04-07", "read": true, "email": "david@example.com" }
        ],
        "latestNotices": [
          { "id": "notice_1", "title": "Exam Schedule Released", "type": "Exam", "date": "2024-04-10", "priority": "High" },
          { "id": "notice_2", "title": "Holiday Announcement", "type": "Announcement", "date": "2024-04-09", "priority": "Medium" },
          { "id": "notice_3", "title": "Admission Results Out", "type": "General", "date": "2024-04-08", "priority": "High" }
        ]
      }
    }
  },
  "meta": {
    "requestId": "req_1234567890",
    "timestamp": "2024-04-10T15:30:00Z",
    "responseTime": "234ms"
  }
}
```

**Implementation Steps:**

1. **Add to lib/api.ts:**
```typescript
export async function getDashboardData() {
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  const data = await response.json();
  return data.data;
}
```

2. **Update dashboard-client.tsx:**
```typescript
'use client';
import { useEffect, useState } from 'react';
import { getDashboardData } from '@/lib/api';

export default function DashboardClient() {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData();
        setDashData(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!dashData) return <div>Error loading dashboard</div>;

  // Use dashData.metrics, dashData.charts, dashData.tables
  // Replace hardcoded values with dynamic data
}
```

**Features Currently Displayed:**
- 4 Metric cards (Total Admissions, Pending, Leads, Unread)
- Line chart (Activity Trends)
- Donut/Pie chart (Admission Status breakdown)
- Recent Admissions table
- Recent Leads table
- Latest Notices table
- Status badges with color coding
- Responsive grid layout

---

## ✅ INTEGRATED PAGES (12 modules)
- Sliders - `/cm/sliders`
- Courses - `/cm/courses`
- Facilities - `/cm/facilities`
- Blog/Posts - `/cm/posts`
- Departments - `/cm/departments`
- Faculty - `/cm/faculty`
- Events - `/ev/events`
- Achievements - `/cm/achievements`
- Notices - `/cm/notices`
- Placements - `/cm/placements`
- Inquiries/Leads - `/ir/inquiries`
- Settings - `/sr/settings`
- Users & Roles - `/um/users`, `/um/roles`

---

## 🟡 NON-INTEGRATED PAGES (8 modules)

### 1. **Admissions/Page**
**Location:** `app/admissions/page.tsx`

**Purpose:** Manage admissions forms, applications, and admission requirements

**Required API Endpoints:**
- `GET /ad/admissions` - Fetch all admissions
- `GET /ad/admissions/:id` - Fetch single admission
- `POST /ad/admissions` - Create admission
- `PUT /ad/admissions/:id` - Update admission
- `DELETE /ad/admissions/:id` - Delete admission
- `GET /ad/admission-requirements` - Fetch admission requirements
- `POST /ad/admission-requirements` - Create requirement
- `PUT /ad/admission-requirements/:id` - Update requirement
- `DELETE /ad/admission-requirements/:id` - Delete requirement

**Expected Data Structure:**
```typescript
Admission {
  id: string
  applicationNumber: string
  studentName: string
  email: string
  phone: string
  course: string
  year: number
  status: 'Pending' | 'Approved' | 'Rejected' | 'Applied'
  applicationDate: string
  documentUrl?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

AdmissionRequirement {
  id: string
  course: string
  requirement: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

**Features Needed:**
- Application list with search & filter by status
- Add/Edit/Delete applications
- Document upload support
- Status badge indicators
- Admission requirements management

---

### 2. **AI Assistant/Page**
**Location:** `app/admissions/ai-assistant/page.tsx`

**Purpose:** AI-powered chatbot for student inquiries and college information

**Required API Endpoints:**
- `POST /ai/chat` - Send message and get AI response
- `GET /ai/chat-history/:userId` - Fetch conversation history
- `POST /ai/chat-history` - Save chat session
- `DELETE /ai/chat/:sessionId` - Delete chat session

**Expected Data Structure:**
```typescript
ChatMessage {
  id: string
  sessionId: string
  userId: string
  message: string
  response: string
  timestamp: string
}

ChatSession {
  id: string
  userId: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}
```

**Features Needed:**
- Real-time chat interface
- Message history
- Session management
- Integration with college KB

---

### 3. **Gallery/Page**
**Location:** `app/content/gallery/page.tsx`

**Purpose:** Manage photo/video gallery with albums and categories

**Required API Endpoints:**
- `GET /cm/gallery` - Fetch all gallery items
- `GET /cm/gallery/albums` - Fetch album categories
- `POST /cm/gallery` - Create gallery item
- `PUT /cm/gallery/:id` - Update gallery item
- `DELETE /cm/gallery/:id` - Delete gallery item
- `POST /cm/gallery/albums` - Create album
- `PUT /cm/gallery/albums/:id` - Update album
- `DELETE /cm/gallery/albums/:id` - Delete album

**Expected Data Structure:**
```typescript
GalleryItem {
  id: string
  title: string
  description: string
  imageUrl: string
  albumId: string
  albumName: string
  category: string
  uploadDate: string
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

GalleryAlbum {
  id: string
  name: string
  description: string
  coverImage: string
  itemCount: number
  createdAt: string
  updatedAt: string
}
```

**Features Needed:**
- Image/video upload
- Album organization
- Grid/carousel display
- Search and filter by album
- Bulk upload support
- Featured items management

---

### 4. **Homepage/Page**
**Location:** `app/content/homepage/page.tsx`

**Purpose:** Manage homepage sections and hero content

**Required API Endpoints:**
- `GET /cm/homepage` - Fetch homepage configuration
- `PUT /cm/homepage` - Update homepage sections
- `POST /cm/homepage/sections` - Add section
- `PUT /cm/homepage/sections/:id` - Update section
- `DELETE /cm/homepage/sections/:id` - Delete section

**Expected Data Structure:**
```typescript
Homepage {
  id: string
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  heroButtons: Button[]
  sections: Section[]
  metadata: {
    seoTitle: string
    seoDescription: string
    seoKeywords: string[]
  }
  createdAt: string
  updatedAt: string
}

Section {
  id: string
  title: string
  content: string
  image: string
  position: number
  type: 'text' | 'text-image' | 'cards' | 'testimonials'
  isActive: boolean
}

Button {
  text: string
  url: string
  type: 'primary' | 'secondary'
}
```

**Features Needed:**
- Hero section editor
- Drag-and-drop section reordering
- Section templates
- Image upload
- Preview functionality
- SEO management

---

### 5. **Quick Links/Page**
**Location:** `app/content/quick-links/page.tsx`

**Purpose:** Manage quick access links for students and staff

**Required API Endpoints:**
- `GET /cm/quick-links` - Fetch all quick links
- `POST /cm/quick-links` - Create quick link
- `PUT /cm/quick-links/:id` - Update quick link
- `DELETE /cm/quick-links/:id` - Delete quick link

**Expected Data Structure:**
```typescript
QuickLink {
  id: string
  title: string
  url: string
  icon: string
  category: string
  order: number
  isFeatured: boolean
  targetAudience: 'Students' | 'Faculty' | 'Staff' | 'All'
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

**Features Needed:**
- CRUD operations
- Icon selection
- Category grouping
- Audience filtering
- Reordering (drag-drop)
- Active/inactive toggle

---

### 6. **Testimonials/Page**
**Location:** `app/content/testimonials/page.tsx`

**Purpose:** Manage student and alumni testimonials

**Required API Endpoints:**
- `GET /cm/testimonials` - Fetch all testimonials
- `POST /cm/testimonials` - Create testimonial
- `PUT /cm/testimonials/:id` - Update testimonial
- `DELETE /cm/testimonials/:id` - Delete testimonial

**Expected Data Structure:**
```typescript
Testimonial {
  id: string
  name: string
  designation: string
  company?: string
  image?: string
  content: string
  rating: number
  type: 'Student' | 'Alumni' | 'Parent'
  isFeatured: boolean
  isApproved: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

**Features Needed:**
- Add/Edit/Delete testimonials
- Image upload
- Star rating system
- Approval workflow
- Featured/active status
- Type filtering (Student/Alumni/Parent)

---

### 7. **Student Corner/Page**
**Location:** `app/student-corner/page.tsx`

**Purpose:** Manage student resources, announcements, and academic materials

**Required API Endpoints:**
- `GET /st/student-resources` - Fetch resources
- `POST /st/student-resources` - Create resource
- `PUT /st/student-resources/:id` - Update resource
- `DELETE /st/student-resources/:id` - Delete resource
- `GET /st/announcements` - Fetch announcements
- `POST /st/announcements` - Create announcement
- `PUT /st/announcements/:id` - Update announcement
- `DELETE /st/announcements/:id` - Delete announcement

**Expected Data Structure:**
```typescript
StudentResource {
  id: string
  title: string
  description: string
  type: 'PDF' | 'Document' | 'Link' | 'Video'
  fileUrl: string
  category: string
  course: string
  uploadDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

Announcement {
  id: string
  title: string
  content: string
  priority: 'High' | 'Medium' | 'Low'
  targetAudience: string
  image?: string
  publishDate: string
  expiryDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

**Features Needed:**
- Resource library with file uploads
- Category organization
- Course-wise filtering
- Announcements management
- Priority/urgency indicators
- Expiry date support

---

### 8. **Login/Page**
**Location:** `app/login/page.tsx`

**Purpose:** User authentication and login management

**Required API Endpoints:**
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/register` - Admin registration
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/me` - Get current user profile

**Expected Data Structure:**
```typescript
LoginRequest {
  email: string
  password: string
}

LoginResponse {
  success: boolean
  data: {
    user: User
    token: string
    refreshToken: string
  }
}

User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  image?: string
}

PasswordResetRequest {
  email: string
}

PasswordReset {
  token: string
  newPassword: string
  confirmPassword: string
}
```

**Features Needed:**
- Email/password login
- JWT token management
- Session management
- Password recovery
- Remember me functionality
- Error handling & validation
- 2FA support (optional)

---

## Summary Table

| Page | Status | Module | Endpoints Count |
|------|--------|--------|-----------------|
| Dashboard | ❌ Not Integrated | Dashboard | 6 |
| Admissions | ❌ Not Integrated | Admissions | 8 |
| AI Assistant | ❌ Not Integrated | AI Chat | 4 |
| Gallery | ❌ Not Integrated | Content | 8 |
| Homepage | ❌ Not Integrated | Content | 5 |
| Quick Links | ❌ Not Integrated | Content | 4 |
| Testimonials | ❌ Not Integrated | Content | 4 |
| Student Corner | ❌ Not Integrated | Student | 8 |
| Login | ❌ Not Integrated | Auth | 7 |
| **TOTAL** | | | **54 Endpoints** |

---

## Implementation Priority

**Phase 1 (Critical):**
1. Dashboard (main landing page - shows all metrics)
2. Login/Auth (security requirement)
3. Admissions (business critical)

**Phase 2 (Important):**
4. Gallery
5. Testimonials
6. Homepage

**Phase 3 (Nice to Have):**
7. Quick Links
8. Student Corner
9. AI Assistant (advanced feature)
