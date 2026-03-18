# GL React Cookbook v2

A modern, TypeScript-first cookbook for building stunning WebGL experiences with React.

## 🚀 Features

- **Modern React 18** with hooks and modern patterns
- **TypeScript** with strict configuration
- **Vite** for lightning-fast development
- **Tailwind CSS** for beautiful, responsive UI
- **WebGL Inspector** for debugging shaders and uniforms
- **Live Examples** with real-time WebGL rendering

## 🛠️ Tech Stack

- React 18.3.1
- TypeScript 5.6.3
- Vite 6.0.1
- Tailwind CSS 3.4.15
- React Router v6
- Heroicons
- GL React & GL React DOM

## 🏃‍♂️ Getting Started

From the root of the monorepo:

```bash
# Install dependencies
yarn install

# Start the development server
yarn cookbook-v2
```

Or directly from this package:

```bash
cd packages/cookbook-v2
yarn dev
```

The cookbook will be available at http://localhost:3001

## 📁 Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── Inspector.tsx   # WebGL inspector for debugging
│   ├── WebGLExample.tsx # Basic WebGL examples
│   └── AdvancedWebGLExample.tsx # Advanced shader examples
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page with live example
│   ├── ExamplesPage.tsx # Examples listing
│   ├── ExampleDetailPage.tsx # Individual example view
│   └── ApiPage.tsx     # API documentation
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Examples

The cookbook includes several WebGL examples:

1. **Hello World** - Basic animated color shader
2. **Color Gradient** - Animated gradient with custom colors
3. **Procedural Noise** - Mathematical noise generation
4. **Wave Animation** - Smooth wave animations

Each example includes:
- Live WebGL preview
- Source code display
- Inspector for debugging uniforms and shaders
- Performance metrics

## 🔧 Inspector

The WebGL Inspector provides:
- Real-time uniform values
- Shader source code display
- Performance metrics (FPS, draw calls, vertices)
- Toggle visibility for debugging

## 🎯 Development

### Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn type-check` - Run TypeScript checks
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues

### Code Style

- Prettier configured with double quotes (monorepo standard)
- ESLint with TypeScript and React rules
- Tailwind CSS for styling

## 🌟 Key Improvements over v1

- ✅ No React 18 warnings (uses createRoot)
- ✅ No string refs (uses createRef)
- ✅ No legacy context API (uses modern React context)
- ✅ TypeScript for better developer experience
- ✅ Modern build system with Vite
- ✅ Beautiful, responsive UI with Tailwind
- ✅ Better code organization and structure


