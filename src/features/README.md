# Features Module Structure

This directory contains all the feature modules for the Legacy AI Prototype application. Each feature is organized in its own folder with a modular structure for easy maintenance and development.

## Structure

```
src/features/
├── ai-interview/          # AI Interview Engine (Ready)
│   └── index.tsx         # Main interview page
├── memory-graph/          # Memory Graph Service (Coming Soon)
│   └── index.tsx         # Memory graph page
├── voice-cloning/         # Voice Cloning & Playback (Coming Soon)
│   └── index.tsx         # Voice cloning page
├── avatar-service/        # Avatar Service (Coming Soon)
│   └── index.tsx         # Avatar service page
└── multimedia/           # Multimedia Upload & Linking (Coming Soon)
    └── index.tsx         # Multimedia page
```

## Feature Status

- ✅ **AI Interview Engine**: Ready for use
- 🔄 **Memory Graph Service**: Coming Soon
- 🔄 **Voice Cloning & Playback**: Coming Soon
- 🔄 **Avatar Service**: Coming Soon
- 🔄 **Multimedia Upload & Linking**: Coming Soon

## Development Guidelines

### Adding New Features
1. Create a new folder in `src/features/` with a descriptive name
2. Create an `index.tsx` file as the main entry point
3. Update the routing in `src/App.tsx`
4. Add the feature to the home page showcase

### Import Paths
All feature modules use relative imports to shared components:
- `../../components/ui/` for UI components
- `../../components/layout/` for layout components
- `../../types/` for TypeScript types

### Component Structure
Each feature should:
- Import `PageContainer` for consistent layout
- Include a "Back to Home" link
- Use consistent styling and theming
- Follow the established design patterns

## Benefits

- **Modularity**: Each feature is self-contained
- **Maintainability**: Easy to find and edit specific features
- **Scalability**: Simple to add new features
- **Organization**: Clear separation of concerns
- **Reusability**: Shared components across features
