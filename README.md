# GitGuide Frontend

🚀 **Next.js frontend for GitGuide** - A modern, modular React application that transforms GitHub repositories into interactive learning journeys with AI-powered guidance.

## 🌟 Overview

GitGuide Frontend is a sophisticated learning platform built with Next.js that provides an intuitive interface for AI-generated learning paths. It features a modular component architecture, real-time chat assistance, and seamless integration with the GitGuide backend API.

### Key Features

- **🎯 Interactive Learning Paths**: Visual representation of AI-generated concepts, subtopics, and tasks
- **💬 AI Chat Assistant**: Context-aware tutoring with full repository understanding
- **🔄 Content Regeneration**: AI-powered customization of learning content with user prompts
- **📱 Responsive Design**: Modern UI with Tailwind CSS and smooth animations
- **🔐 Secure Authentication**: Clerk-based authentication with JWT token handling
- **⚡ Real-time Updates**: Live status updates during AI processing
- **🎨 Modular Components**: Clean, maintainable component architecture

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- GitGuide Backend running (see backend README)
- Clerk account for authentication

### Installation

```bash
# Clone and navigate to frontend
cd gitguide_frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Setup

Create a `.env.local` file:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Development settings
NODE_ENV=development
```

### Run Development Server

```bash
# Start development server
npm run dev

# Application will be available at:
# http://localhost:3000
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## 🏗️ Modular Architecture

### Clean Component Structure

The frontend follows **the same clean architecture principles as the backend** with crystal-clear naming conventions and single-responsibility components.

```
src/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── project/[id]/            # Dynamic project routes
├── components/                   # Modular Components
│   ├── learning-path/           # Learning Path Components
│   │   ├── LearningPathHeader.tsx    # Header with skill level & controls
│   │   ├── ProjectOverviewCard.tsx   # Project overview section
│   │   ├── ConceptsList.tsx          # Main concepts container
│   │   ├── ConceptCard.tsx           # Individual concept with expand/collapse
│   │   ├── SubtopicCard.tsx          # Individual subtopic with tasks
│   │   ├── TaskCard.tsx              # Individual task with difficulty
│   │   ├── types.ts                  # Shared TypeScript interfaces
│   │   └── index.ts                  # Clean exports
│   ├── project-detail/          # Project Detail Components
│   │   ├── ProjectDetailHeader.tsx   # Project info & status display
│   │   ├── LearningPathGenerator.tsx # Generate learning path UI
│   │   ├── ContentDisplay.tsx        # Selected content viewer
│   │   └── index.ts                  # Clean exports
│   ├── ConceptsSidebarModular.tsx    # Modular sidebar using subcomponents
│   ├── ProjectDetailModular.tsx      # Modular detail view
│   ├── ChatAssistant.tsx             # AI chat interface
│   ├── Dashboard.tsx                 # Main dashboard
│   ├── RegenerateModal.tsx           # Content regeneration modal
│   └── [other components]            # Additional UI components
├── services/                     # API Integration
│   └── api.ts                   # Backend API client
└── middleware.ts                # Clerk authentication middleware
```

### Component Responsibilities

#### **Learning Path Components**

| Component | Purpose | Responsibility |
|-----------|---------|----------------|
| `LearningPathHeader` | Header section | Display skill level, domain, regenerate whole path |
| `ProjectOverviewCard` | Overview section | Project overview with regenerate option |
| `ConceptsList` | Concepts container | Render all concepts with error/loading states |
| `ConceptCard` | Individual concept | Single concept with expand/collapse & regenerate |
| `SubtopicCard` | Individual subtopic | Single subtopic with tasks list & regenerate |
| `TaskCard` | Individual task | Single task with difficulty badge & regenerate |

#### **Project Detail Components**

| Component | Purpose | Responsibility |
|-----------|---------|----------------|
| `ProjectDetailHeader` | Project info | Repository info, tech stack, processing status |
| `LearningPathGenerator` | Generation UI | Generate button, processing states, errors |
| `ContentDisplay` | Content viewer | Display selected content with verify task button |

---

## 🔗 API Integration

### Backend Alignment

The frontend **perfectly aligns** with the backend's API structure using clean service functions:

```typescript
// services/api.ts - All API interactions

// Project Management
export const createProject = async (projectData, getToken) => { ... }
export const getUserProjects = async (getToken) => { ... }
export const getProjectConcepts = async (projectId, getToken) => { ... }

// AI Agent Processing
export const triggerAgentProcessing = async (projectId, getToken) => { ... }
export const getAgentStatus = async (projectId, getToken) => { ... }
export const checkAgentHealth = async () => { ... }

// Content Regeneration
export const regenerateProjectOverview = async (projectId, userPrompt, getToken) => { ... }
export const regenerateWholePath = async (projectId, userPrompt, getToken) => { ... }
export const regenerateConcept = async (projectId, conceptId, userPrompt, getToken) => { ... }
export const regenerateSubtopic = async (projectId, conceptId, subtopicId, userPrompt, getToken) => { ... }
export const regenerateTask = async (projectId, conceptId, subtopicId, taskId, userPrompt, getToken) => { ... }

// AI Chat
export const sendChatMessage = async (projectId, message, getToken) => { ... }
export const getChatContext = async (projectId, getToken) => { ... }
export const checkChatHealth = async () => { ... }
```

### API Endpoints Used

| Frontend Function | Backend Endpoint | Purpose |
|-------------------|------------------|---------|
| `createProject` | `POST /projects` | Create new learning project |
| `getUserProjects` | `GET /projects` | Get user's projects |
| `getProjectConcepts` | `GET /projects/{id}/concepts` | Get learning path |
| `triggerAgentProcessing` | `POST /agent/process` | Start AI processing |
| `getAgentStatus` | `GET /agent/status/{id}` | Check processing status |
| `regenerateProjectOverview` | `POST /agent/regenerate/project-overview` | Regenerate overview |
| `regenerateWholePath` | `POST /agent/regenerate/whole-path` | Regenerate entire path |
| `regenerateConcept` | `POST /agent/regenerate/concept` | Regenerate concept |
| `regenerateSubtopic` | `POST /agent/regenerate/subtopic` | Regenerate subtopic |
| `regenerateTask` | `POST /agent/regenerate/task` | Regenerate task |
| `sendChatMessage` | `POST /chat/project/{id}` | Send chat message |
| `getChatContext` | `GET /chat/project/{id}/context` | Get chat context |

---

## 🎨 Design System

### Styling Architecture

```typescript
// Tailwind CSS with custom design tokens
├── globals.css                 # Global styles and CSS variables
├── Responsive Design          # Mobile-first approach
├── Dark Theme                 # Consistent dark theme across components
├── Component Variants         # Button, card, modal variants
└── Animation System          # Smooth transitions and loading states
```

### Color Palette

```css
/* Primary Colors */
--purple-400: #a855f7;    /* Primary buttons, highlights */
--blue-400: #3b82f6;      /* Secondary actions, links */
--green-400: #22c55e;     /* Success states, unlocked items */
--yellow-400: #fbbf24;    /* Warning states, tasks */
--red-400: #ef4444;       /* Error states, destructive actions */

/* Background & UI */
--black: #000000;         /* Primary background */
--white-10: rgba(255,255,255,0.1);  /* Subtle borders */
--white-20: rgba(255,255,255,0.2);  /* Card backgrounds */
```

### Component Patterns

```typescript
// Consistent patterns across components:

// Loading States
<div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full" />

// Cards
<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl" />

// Buttons
<button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-200 transform hover:scale-105" />

// Status Indicators
<div className={`w-3 h-3 rounded-full ${isUnlocked ? 'bg-green-400' : 'bg-gray-400'}`} />
```

---

## 🛠️ Development Workflow

### Component Development

```typescript
// 1. Create component with clear purpose
export default function TaskCard({ task, onTaskClick, onRegenerateTask }: TaskCardProps) {
  return (
    <div className="flex items-center mt-1">
      {/* Task display logic */}
    </div>
  );
}

// 2. Define clear props interface
interface TaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onRegenerateTask: (task: Task, conceptId: string, subtopicId: string, taskId: string) => void;
  conceptId: string;
  subtopicId: string;
}

// 3. Use shared types
import { Task } from './types';
```

### State Management

```typescript
// Local state for component-specific data
const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
const [isProcessing, setIsProcessing] = useState(false);

// Event handlers passed down clearly
const handleConceptClick = (concept: Concept, conceptIndex: number) => {
  onContentSelect({
    type: 'concept',
    title: concept.name,
    description: concept.description
  });
};
```

### API Integration Pattern

```typescript
// Consistent error handling and loading states
const loadConcepts = async () => {
  try {
    setLoading(true);
    setError('');
    
    const data = await getProjectConcepts(projectIdNum, getToken);
    setConcepts(data.concepts || []);
    
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load concepts');
  } finally {
    setLoading(false);
  }
};
```

---

## 📱 User Experience

### Learning Path Flow

1. **Project Creation**: Users input GitHub repository URL, skill level, and domain
2. **AI Processing**: Real-time status updates during repository analysis and learning path generation
3. **Interactive Learning**: Click concepts, subtopics, and tasks to view detailed explanations
4. **Content Customization**: Regenerate any content with custom prompts
5. **AI Assistance**: Chat with AI tutor for personalized guidance
6. **Progress Tracking**: Visual indicators for unlocked content and completion status

### Responsive Design

```typescript
// Mobile-first approach with Tailwind breakpoints
<div className="
  w-full md:w-1/3           // Full width on mobile, 1/3 on desktop
  p-4 md:p-6               // Smaller padding on mobile
  text-sm md:text-base     // Smaller text on mobile
  space-y-2 md:space-y-4   // Tighter spacing on mobile
">
```

### Accessibility

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: High contrast ratios for readability
- **Focus Indicators**: Clear focus states for all interactive elements

---

## 🔐 Authentication

### Clerk Integration

```typescript
// Middleware for route protection
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### Authentication Flow

```typescript
// Token extraction for API calls
import { useAuth } from '@clerk/nextjs';

const { getToken, isLoaded } = useAuth();

// API calls with authentication
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${await getToken()}`,
    'Content-Type': 'application/json',
  },
});
```

---

## 🚀 Performance Optimization

### Code Splitting

```typescript
// Automatic code splitting with Next.js dynamic imports
const ChatAssistant = dynamic(() => import('./ChatAssistant'), {
  loading: () => <div>Loading chat...</div>
});
```

### Image Optimization

```typescript
// Next.js Image component for optimized loading
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="GitGuide Logo"
  width={200}
  height={100}
  priority={true}
/>
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze  # If analyzer is configured

# Key optimizations:
# - Tree shaking unused code
# - Dynamic imports for large components  
# - Image optimization
# - CSS purging with Tailwind
```

---

## 🧪 Testing Strategy

### Component Testing

```typescript
// Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from './TaskCard';

test('renders task card with difficulty', () => {
  const mockTask = {
    id: 1,
    name: 'Test Task',
    description: 'Test Description',
    difficulty: 'easy',
    isUnlocked: true,
    status: 'not_started'
  };

  render(<TaskCard task={mockTask} onTaskClick={jest.fn()} />);
  
  expect(screen.getByText('Test Task')).toBeInTheDocument();
  expect(screen.getByText('easy')).toBeInTheDocument();
});
```

### API Testing

```typescript
// Mock API calls for testing
jest.mock('../../services/api', () => ({
  getProjectConcepts: jest.fn(() => Promise.resolve({
    concepts: [{ id: 1, name: 'Test Concept', subTopics: [] }]
  }))
}));
```

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - NEXT_PUBLIC_API_URL
```

### Environment Configuration

```typescript
// Production environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Build Configuration

```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com'],
  },
};

export default nextConfig;
```

---

## 📊 Project Structure Benefits

### ✅ Modular Architecture Benefits

- **Maintainability**: Each component has a single, clear responsibility
- **Reusability**: Components can be used across different contexts
- **Testability**: Easy to test individual components in isolation
- **Team Development**: Multiple developers can work on different components
- **Performance**: Smaller components lead to better React optimization

### ✅ Backend-Frontend Harmony

| **Backend Pattern** | **Frontend Pattern** |
|--------------------|--------------------|
| `core_endpoints.py` | `ConceptCard.tsx` |
| `auth_utilities.py` | `TaskCard.tsx` |
| `database_utilities.py` | `learning-path/types.ts` |
| Single responsibilities | Single responsibilities |
| Clear naming | Clear naming |
| Modular organization | Modular organization |

### ✅ Development Experience

- **Fast Development**: Find and modify components quickly
- **Easy Debugging**: Know exactly which component handles what functionality
- **Consistent Patterns**: Same event handling and state management patterns
- **Type Safety**: Comprehensive TypeScript interfaces
- **Clean Imports**: Organized through index files

---

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing (if configured)
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

---

## 📝 Component Usage Examples

### Using Modular Components

```typescript
// Main project detail page
<ProjectDetailModular projectId={projectId} />
// → Uses all subcomponents automatically

// Individual component usage
<TaskCard 
  task={task}
  onTaskClick={handleTaskClick}
  onRegenerateTask={handleRegenerate}
  conceptId="concept-1"
  subtopicId="subtopic-1"
/>

// Learning path sidebar
<ConceptsSidebarModular
  projectId={projectId}
  projectDomain="Full Stack"
  skillLevel="Intermediate"
  onContentSelect={handleContentSelect}
/>
```

### Event Handling Pattern

```typescript
// Clear event handler pattern used throughout
const handleConceptClick = (concept: Concept, conceptIndex: number) => {
  setSelectedContent({
    type: 'concept',
    title: concept.name,
    description: concept.description
  });
};

const handleRegenerateConcept = async (concept: Concept, conceptId: string) => {
  try {
    await regenerateConcept(projectId, conceptId, userPrompt, getToken);
    // Reload concepts after regeneration
    await loadConcepts();
  } catch (error) {
    console.error('Regeneration failed:', error);
  }
};
```

---

## 🤝 Contributing

### Development Guidelines

1. **Follow naming conventions**: Use descriptive component names
2. **Keep components focused**: Single responsibility per component
3. **Use TypeScript**: Proper interfaces for all props and state
4. **Consistent styling**: Follow Tailwind CSS patterns
5. **Test components**: Add tests for new functionality

### Code Style

```typescript
// ✅ Good: Clear component purpose and props
export default function TaskCard({ task, onTaskClick }: TaskCardProps) {
  return <div>...</div>;
}

// ❌ Bad: Generic name and unclear purpose
export default function Component({ data, handler }: Props) {
  return <div>...</div>;
}
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🆘 Support

For issues and questions:
1. Check the component documentation in code comments
2. Review the API integration in `services/api.ts`
3. Ensure backend is running and accessible
4. Verify Clerk authentication configuration
5. Check browser console for error messages

**Built with ❤️ for developers who want to learn from real-world GitHub repositories**
