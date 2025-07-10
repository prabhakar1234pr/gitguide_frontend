# GitGuide Frontend

A modern Next.js application that transforms GitHub repositories into personalized learning journeys with interactive project management and AI-powered assistance.

## 🚀 Features

### 🔐 Authentication
- **Clerk Integration**: Secure user authentication and session management
- **JWT Token Handling**: Seamless backend API authentication
- **User Profile Management**: Dynamic user data from Clerk API

### 🏠 Dashboard
- **Project Overview**: Visual grid display of all learning projects
- **Create New Projects**: Modal-based project creation workflow
- **Project Management**: Full CRUD operations with delete functionality
- **Responsive Design**: Mobile-first, adaptive layout

### 📊 Project Detail System
- **Modular Architecture**: Separate components for maintainability
- **Three-Panel Layout**: Concepts sidebar, main content, chat assistant
- **Real-time Data**: Live project and task information from backend

### 🎯 Task Management
- **Sequential Learning**: Step-by-step task progression
- **Progress Tracking**: Visual progress indicators and status management
- **Task Cards**: Interactive task display with verify functionality
- **Status Management**: not_started → in_progress → done workflow

### 🤖 AI Assistant
- **Interactive Chat**: Real-time learning support and guidance
- **Context-Aware**: Responds based on current task and project
- **Learning Support**: Concept explanations and troubleshooting help

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **State Management**: React Hooks
- **API**: RESTful communication with FastAPI backend

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with authentication
│   ├── page.tsx             # Main route handler
│   └── project/[id]/
│       └── page.tsx         # Dynamic project detail routes
├── components/
│   ├── Dashboard.tsx        # Main dashboard component
│   ├── LandingPage.tsx      # Marketing page for visitors
│   ├── ProjectCard.tsx      # Individual project cards
│   ├── ProjectDetail.tsx    # Project detail page container
│   ├── ConceptsSidebar.tsx  # Learning concepts sidebar
│   ├── TaskCard.tsx         # Task display component
│   ├── ChatAssistant.tsx    # AI chat interface
│   └── NewProjectModal.tsx  # Project creation modal
└── services/
    └── api.ts               # API service layer
```

## 🎨 Design System

### Color Scheme
- **Primary**: Purple-blue-indigo gradient theme
- **Background**: Gradient from purple-900 via blue-900 to indigo-900
- **Accent**: White/transparent overlay elements
- **UI Elements**: Glassomorphic design with backdrop blur

### Component Architecture
- **Modularity**: All components >50 lines in separate files
- **Reusability**: Consistent props interfaces and styling
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔧 Environment Setup

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Running GitGuide backend on port 8000

### Environment Variables
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

### Installation & Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Application Flow

### 1. Authentication Flow
1. User visits application
2. Clerk handles authentication/registration
3. JWT token stored for API calls
4. User redirected to dashboard

### 2. Project Creation
1. User clicks "Create New Project"
2. Modal opens with form fields
3. Form submits to backend API
4. New project appears in dashboard

### 3. Project Detail Experience
1. User clicks project card
2. Navigate to `/project/{id}`
3. Load project data and tasks
4. Three-panel interface loads:
   - **Left**: Learning concepts for domain
   - **Center**: Current task with progress
   - **Right**: AI chat assistant

### 4. Task Management
1. Tasks load in sequential order
2. User reviews task description
3. Complete task and click "Verify"
4. Progress advances to next task

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layout for tablets
- **Desktop**: Full three-panel layout
- **Breakpoints**: Tailwind CSS responsive utilities

## 🔒 Security Features

- **Client-Side Auth**: Clerk authentication verification
- **Token Management**: Secure JWT token handling
- **API Security**: Authorization headers on all requests
- **User Isolation**: Users only see their own projects

## 🎯 Key Components

### Dashboard.tsx
- Project listing and management
- Create new project functionality
- Real-time project updates
- Delete project with confirmation

### ProjectDetail.tsx
- Main project detail container
- Handles data loading and state
- Coordinates three-panel layout

### TaskCard.tsx
- Individual task display
- Progress tracking
- Verify task functionality
- Status management

### ChatAssistant.tsx
- Interactive AI chat interface
- Context-aware responses
- Learning support and guidance

## 🚀 Deployment

### Development
```bash
npm run dev
```
Access at: `http://localhost:3000`

### Production
```bash
npm run build
npm start
```

### Vercel Deployment
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 📊 Performance

- **Next.js Optimization**: Automatic code splitting and optimization
- **Image Optimization**: Built-in Next.js image optimization
- **Font Loading**: Optimized font loading with `next/font`
- **Bundle Analysis**: Use `npm run analyze` to check bundle size

## 🔄 API Integration

The frontend communicates with the FastAPI backend through:
- **Projects**: CRUD operations for learning projects
- **Tasks**: Task management and progress tracking
- **Users**: Profile and authentication data
- **Real-time Updates**: Live data synchronization

## 🎨 Customization

### Theming
- Primary colors defined in Tailwind config
- Gradient backgrounds easily customizable
- Component styling through Tailwind classes

### Features
- Modular architecture allows easy feature addition
- Component-based design for reusability
- Clear separation of concerns

## 📋 Future Enhancements

- Real-time collaboration features
- Advanced AI integration
- Mobile app development
- Enhanced analytics dashboard
- Social learning features
