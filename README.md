# 📝 MarkdownPreview - Modern Markdown Editor

A powerful, real-time markdown editor built with React, Redux, and modern web technologies. Create, edit, and preview markdown documents with a beautiful, responsive interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)

## ✨ Features

### 🚀 **Core Functionality**
- **Real-time Preview**: Live markdown rendering as you type
- **Multiple View Modes**: Editor-only, Split-view, or Preview-only
- **File Management**: Create, save, load, and manage markdown documents
- **Cloud Storage**: Secure document storage with Appwrite backend
- **File Upload**: Import existing markdown files (.md, .markdown, .txt)
- **Copy to Clipboard**: One-click content copying

### 🎨 **User Experience**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching with system preference
- **Fullscreen Mode**: Distraction-free writing experience
- **Keyboard Shortcuts**: Quick view switching (Ctrl+1/2/3)
- **Auto-save**: Automatic content preservation to localStorage
- **Toast Notifications**: Clear feedback for all actions

### 🔧 **Developer Features**
- **Redux State Management**: Centralized state with Redux Toolkit and async thunks
- **Modular Architecture**: Component-based design for maintainability
- **Service Layer**: Separated business logic in dedicated service modules
- **Custom Hooks**: Reusable logic with React hooks
- **Error Boundaries**: Robust error handling and user feedback
- **Hot Module Replacement**: Fast development with Vite
- **Security**: XSS protection with DOMPurify sanitization

## 🛠️ **Tech Stack**

### **Frontend**
- **React 19+** - Modern React with hooks and functional components
- **Redux Toolkit** - Efficient state management with RTK Query
- **React Router** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server

### **Markdown Processing**
- **Marked.js** - Markdown parser and compiler
- **DOMPurify** - XSS sanitization for secure HTML rendering
- **GitHub Flavored Markdown** - Extended markdown syntax support

### **Backend & Storage**
- **Appwrite** - Backend-as-a-Service for authentication and database
- **Local Storage** - Client-side backup and preferences

### **Development Tools**
- **ESLint** - Code linting and quality enforcement
- **Prettier** - Code formatting (configured)
- **Git** - Version control

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager
- Git (for cloning)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Markdown_Preview.git
cd Markdown_Preview
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
VITE_APPWRITE_ENDPOINT=your_appwrite_endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_MARKDOWN_COLLECTION_ID=your_collection_id
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open in browser**
Navigate to `http://localhost:5173`

### **Build for Production**
```bash
npm run build
# or
yarn build
```

## 📱 **Usage**

### **Creating Documents**
- Visit `/editor/new` to create a new document
- Start typing in the editor pane
- See live preview in the right pane (split view)

### **Managing Documents**
- **Save**: Click the save button or use Ctrl+S
- **Load**: Upload existing markdown files via the Upload button
- **Copy**: Copy content to clipboard with the Copy button

### **View Modes**
- **Editor**: Focus on writing with syntax highlighting
- **Split**: Edit and preview simultaneously  
- **Preview**: Focus on beautifully rendered output
- **Fullscreen**: Distraction-free mode for focused writing

### **File Operations**
- **Upload Files**: Click "Upload" to import .md, .markdown, or .txt files
- **Content Replacement**: Uploaded files replace current editor content (with confirmation)
- **Auto-backup**: Content automatically saved to localStorage as you type
- **Copy to Clipboard**: One-click copying of entire document content
- **Document Access Control**: Secure document ownership and permissions

## 🏗️ **Project Structure**

```
src/
├── app/                 # Redux store configuration
│   └── store.js         # Root store with middleware
├── components/          # Reusable UI components
│   ├── Editor/          # Editor-specific components
│   │   ├── EditorHeader.jsx    # File controls and view modes
│   │   ├── EditorToolbar.jsx   # Formatting and utility buttons
│   │   ├── EditorLayout.jsx    # Main editor layout container
│   │   ├── EditorPane.jsx      # Text editor with syntax highlighting
│   │   ├── PreviewPane.jsx     # Markdown preview with styling
│   │   └── PreviewModeInfo.jsx # Information banner component
│   ├── Header.jsx       # Main navigation header
│   ├── Footer.jsx       # Site footer
│   ├── CTASection.jsx   # Call-to-action components
│   ├── DemoSection.jsx  # Demo and feature showcase
│   ├── FeaturesSection.jsx # Features listing
│   └── HeroSection.jsx  # Landing page hero
├── pages/               # Main page components
│   ├── Home.jsx         # Landing page with features
│   ├── Dashboard.jsx    # User dashboard and file management
│   └── MarkdownEditor.jsx # Main editor page with Redux integration
├── features/            # Redux slices and domain logic
│   ├── editor/          # Editor state management
│   │   └── editorSlice.js # Redux slice with async thunks
│   └── Counter/         # Example counter feature
│       ├── Counter.jsx  # Counter component
│       └── counterSlice.js # Counter Redux slice
├── hooks/               # Custom React hooks
│   ├── useTheme.js      # Theme management and system detection
│   ├── useToast.js      # Toast notification system
│   └── useMarkdownOperations.js # Markdown formatting operations
├── contexts/            # React context providers
│   └── AuthContext.jsx  # Authentication state and methods
├── services/            # External API and business logic
│   └── appwriteService.js # Appwrite database operations and queries
├── config/              # Configuration files
│   └── appwrite.config.js # Appwrite client configuration
├── lib/                 # External library initialization
│   └── appwrite.js      # Appwrite client setup
├── assets/              # Static assets
│   └── react.svg        # React logo
├── App.jsx              # Root component with routing
├── App.css              # Global styles
├── index.css            # Base CSS and Tailwind imports
└── main.jsx             # Application entry point
```

## ⚙️ **Configuration**

### **Appwrite Setup**
1. Create an Appwrite account and project at [appwrite.io](https://appwrite.io)
2. Set up a database and collection for markdown documents with these attributes:
   - `title` (string, required)
   - `content` (string, required) 
   - `userId` (string, required)
   - `createdAt` (datetime)
   - `updatedAt` (datetime)
3. Configure authentication (email/password recommended)
4. Update environment variables with your Appwrite credentials
5. Set up document-level permissions for user access control

### **Environment Variables**
Create a `.env` file with the following variables:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1     # Your Appwrite endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id                # Your project ID
VITE_APPWRITE_DATABASE_ID=your_database_id              # Your database ID  
VITE_APPWRITE_COLLECTION_ID=your_collection_id          # Your collection ID
```

### **Theme Configuration**
The app uses Tailwind CSS with automatic dark/light mode detection. Customize themes in:
- `src/hooks/useTheme.js` - Theme logic and system preference detection
- `tailwind.config.js` - Tailwind configuration and custom colors
- CSS variables for consistent theming across components

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/yourusername/MarkdownPreview.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** following our guidelines below
5. **Test your changes** thoroughly
6. **Commit your changes** with descriptive messages
   ```bash
   git commit -m 'Add: Amazing new feature with XYZ functionality'
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request** with a clear description

### **Development Guidelines**
- **Code Style**: Follow the existing code style and structure
- **Components**: Keep components small, focused, and reusable
- **Redux**: Use Redux Toolkit patterns for state management
- **Comments**: Add comments for complex logic and business rules
- **Testing**: Test your changes across different browsers and screen sizes
- **Documentation**: Update README and code comments as needed
- **Performance**: Consider performance implications of changes

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **[Marked.js](https://marked.js.org/)** - Markdown parsing
- **[DOMPurify](https://github.com/cure53/DOMPurify)** - XSS sanitization
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[Appwrite](https://appwrite.io/)** - Backend services
- **[React](https://reactjs.org/)** - UI framework
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management

## 📞 **Support & Community**

If you encounter any issues or have questions:

1. **Search existing issues** in the [Issues](https://github.com/yourusername/MarkdownPreview/issues) page
2. **Create a new issue** with detailed information if your problem isn't covered
3. **Join community discussions** for feature requests and general questions
4. **Check the documentation** for setup and configuration help

### **Bug Reports**
When reporting bugs, please include:
- Operating system and browser version
- Steps to reproduce the issue
- Expected vs actual behavior
- Console errors (if any)
- Screenshots (if applicable)

### **Feature Requests**
For new features, please describe:
- The problem you're trying to solve
- Your proposed solution
- Why this would benefit other users
- Any implementation ideas you have

---

**Made with ❤️ using React, Redux, and modern web technologies**
