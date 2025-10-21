# Contributing to COGnitive

Thank you for your interest in contributing to COGnitive! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be kind and courteous to all contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/COGnitive.git
   cd COGnitive
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/COGnitive.git
   ```

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key (get one at https://platform.openai.com/api-keys)
- Git

### Installation

1. **Install dependencies** for both frontend and backend:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   
   Backend (`backend/.env`):
   ```bash
   OPENAI_API_KEY=your_actual_api_key_here
   PORT=3001
   NODE_ENV=development
   ```
   
   Frontend (`frontend/.env` - optional):
   ```bash
   VITE_API_URL=http://localhost:3001
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```
   
   This starts both frontend (port 5173) and backend (port 3001).

### Running Separately

If you prefer to run frontend and backend in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Project Structure

```
COGnitive/
├── backend/
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Express middleware
│   │   ├── config/           # Configuration files
│   │   └── types/            # TypeScript type definitions
│   ├── uploads/              # Temporary file storage (gitignored)
│   ├── lectures/             # Lecture data storage (gitignored)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client and services
│   │   └── App.tsx           # Main application
│   └── package.json
│
└── docs/                     # Documentation
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces (avoid `any` when possible)
- Use `interface` for object shapes, `type` for unions/intersections
- Enable strict mode in `tsconfig.json`

Example:
```typescript
// Good
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Avoid
const message: any = { ... };
```

### React Components

- Use functional components with hooks
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use TypeScript for props

Example:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}
```

### Express Routes

- Keep route handlers thin (business logic in services)
- Use async/await for asynchronous operations
- Proper error handling with try/catch
- Add OpenAPI/Swagger documentation comments

Example:
```typescript
/**
 * @openapi
 * /api/endpoint:
 *   post:
 *     summary: Brief description
 *     ...
 */
router.post('/endpoint', async (req, res) => {
  try {
    const result = await someService(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

### Naming Conventions

- **Files**: camelCase for TypeScript/JavaScript files
- **Components**: PascalCase (e.g., `ChatInterface.tsx`)
- **Functions**: camelCase (e.g., `processLecture`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Interfaces/Types**: PascalCase (e.g., `ChatRequest`)

### Code Formatting

- Use 2 spaces for indentation
- Single quotes for strings (except when avoiding escapes)
- Semicolons at end of statements
- Trailing commas in multi-line objects/arrays

Consider using Prettier and ESLint:
```bash
npm install -D prettier eslint
```

## Making Changes

### Branch Naming

Create descriptive branch names:
- `feature/add-export-functionality`
- `fix/audio-upload-error`
- `docs/update-readme`
- `refactor/simplify-chat-logic`

### Commit Messages

Write clear, descriptive commit messages:

```
feat: add PDF export functionality for notes

- Implement PDF generation with jsPDF
- Add download button to notes interface
- Update documentation
```

Follow this format:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring without functionality change
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies, etc.

### Keeping Your Fork Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Testing

### Manual Testing

Before submitting a PR, test your changes:

1. **Backend**: 
   - API endpoints work as expected
   - Error handling works properly
   - No console errors

2. **Frontend**:
   - UI displays correctly
   - User interactions work
   - No console errors or warnings
   - Test in Chrome and Firefox

### Testing Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] All features work in development mode
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] Changes tested manually
- [ ] Documentation updated if needed

### Future: Automated Tests

We plan to add:
- Unit tests (Jest/Vitest)
- Integration tests (Supertest for API)
- E2E tests (Playwright/Cypress)

## Submitting Changes

### Pull Request Process

1. **Update your branch** with the latest from main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Push to your fork**:
   ```bash
   git push origin your-feature-branch
   ```

3. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changed and why
   - Include screenshots for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex code sections
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tested changes work
```

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

## Reporting Bugs

### Before Submitting

1. **Check existing issues** to avoid duplicates
2. **Update to latest version** to see if bug still exists
3. **Gather information**:
   - Browser and OS
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and console logs

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g., macOS, Windows, Linux]
 - Browser: [e.g., Chrome 120, Firefox 121]
 - Version: [e.g., 1.0.0]

**Additional context**
Any other context about the problem.
```

## Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** first
2. **Describe the problem** your feature would solve
3. **Propose a solution** (but be open to alternatives)
4. **Consider implementation** complexity

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Add any other context or screenshots.
```

## Development Tips

### Hot Reloading

Both frontend and backend support hot reloading:
- Frontend: Vite automatically reloads on changes
- Backend: `ts-node-dev` restarts server on changes

### Debugging

**Backend**:
```bash
# Add console.log statements
console.log('Debug info:', variable);

# Or use Node debugger
node --inspect-brk dist/index.js
```

**Frontend**:
```typescript
// React DevTools (Chrome extension)
// Console logging
console.log('Component state:', state);
```

### API Testing

Use the Swagger UI at `http://localhost:3001/api/docs` to test API endpoints interactively.

Or use curl:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

## Questions?

If you have questions:
- Check existing documentation
- Search closed issues
- Open a new issue with the "question" label

## License

By contributing to COGnitive, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to COGnitive!

