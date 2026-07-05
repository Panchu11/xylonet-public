# Contributing to XyloNet

Thank you for your interest in contributing to XyloNet! We welcome contributions from the community and are grateful for any help you can provide.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

1. **Be Respectful**: Treat everyone with respect and consideration
2. **Be Constructive**: Provide helpful, constructive feedback
3. **Be Inclusive**: Welcome newcomers and help them get started
4. **Be Professional**: Keep discussions focused and productive

---

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **Git**
- **A code editor** (VS Code recommended)
- **MetaMask** or similar Web3 wallet

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/XyloNet.git
cd XyloNet
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/xylonet/XyloNet.git
```

---

## Development Setup

### Smart Contracts

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local node (optional)
npx hardhat node
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Environment Variables

Create `.env` files as needed:

**contracts/.env**
```env
PRIVATE_KEY=your_test_private_key_here
```

**frontend/.env.local** (optional)
```env
NEXT_PUBLIC_CUSTOM_RPC=your_custom_rpc_url
```

---

## How to Contribute

### Types of Contributions

We welcome many types of contributions:

| Type | Description |
|------|-------------|
| **Bug Fixes** | Fix issues in the codebase |
| **Features** | Add new functionality |
| **Documentation** | Improve or add documentation |
| **Tests** | Add or improve test coverage |
| **Performance** | Optimize code performance |
| **Refactoring** | Improve code quality |

### Finding Issues

- Check the [Issues](https://github.com/xylonet/XyloNet/issues) page
- Look for issues labeled `good first issue` for beginners
- Look for `help wanted` for important issues
- Feel free to create new issues for bugs or feature requests

### Before You Start

1. **Check existing issues** to avoid duplicates
2. **Discuss major changes** by opening an issue first
3. **Keep changes focused** - one feature/fix per PR
4. **Write tests** for new functionality
5. **Update documentation** if needed

---

## Pull Request Process

### 1. Create a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new functionality
- Update documentation as needed

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing new feature"
```

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

### 5. PR Requirements

- [ ] Descriptive title and description
- [ ] Links to related issues
- [ ] Tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Documentation updated (if applicable)
- [ ] No merge conflicts

### 6. Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

---

## Coding Standards

### Solidity

Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title ContractName
 * @notice Brief description
 * @dev Detailed description
 */
contract ContractName {
    // State variables
    uint256 public value;
    
    // Events
    event ValueUpdated(uint256 oldValue, uint256 newValue);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "FORBIDDEN");
        _;
    }
    
    // Constructor
    constructor(uint256 _value) {
        value = _value;
    }
    
    // External functions
    function setValue(uint256 _value) external onlyOwner {
        uint256 oldValue = value;
        value = _value;
        emit ValueUpdated(oldValue, _value);
    }
    
    // View functions
    function getValue() external view returns (uint256) {
        return value;
    }
    
    // Internal functions
    function _internalHelper() internal pure returns (uint256) {
        return 42;
    }
}
```

#### Solidity Best Practices

- Use `require` with descriptive error messages
- Order functions: external → public → internal → private
- Use NatSpec comments for all public functions
- Prefer `immutable` and `constant` where possible
- Always use `lock` modifier for state-changing functions
- Follow CEI (Checks-Effects-Interactions) pattern

### TypeScript/React

Follow the project's ESLint configuration:

```typescript
// Components
export function MyComponent({ prop }: MyComponentProps) {
  const [state, setState] = useState<string>('');
  
  const handleClick = () => {
    setState('clicked');
  };
  
  return (
    <div className="container">
      <button onClick={handleClick}>
        {prop}
      </button>
    </div>
  );
}

// Types
interface MyComponentProps {
  prop: string;
}

// Hooks
export function useMyHook() {
  const { data } = useReadContract({
    // ...
  });
  
  return { data };
}
```

#### TypeScript Best Practices

- Use explicit types, avoid `any`
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Use meaningful variable and function names
- Keep components focused and small
- Use Tailwind CSS for styling

### CSS/Tailwind

```css
/* globals.css */

/* Use CSS custom properties for theming */
:root {
  --color-primary: #00d4aa;
  --color-background: #0a0a12;
}

/* Use descriptive class names */
.swap-widget {
  background: var(--color-background);
}

/* Mobile-first approach */
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    max-width: 480px;
  }
}
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no new feature or fix |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat(swap): add MAX button to swap input"

# Bug fix
git commit -m "fix(bridge): correct domain ID for Base chain"

# Documentation
git commit -m "docs: update README with deployment instructions"

# Refactor
git commit -m "refactor(vault): simplify share calculation logic"
```

---

## Testing

### Smart Contract Tests

```bash
cd contracts

# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/XyloRouter.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

### Writing Tests

```javascript
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('XyloRouter', function () {
  let router, factory, usdc, eurc;
  let owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    // Setup contracts...
  });

  describe('swap', function () {
    it('should swap tokens correctly', async function () {
      const amountIn = ethers.parseUnits('100', 6);
      const amountOut = await router.getAmountOut(usdc, eurc, amountIn);
      
      await router.connect(user).swap({
        tokenIn: usdc,
        tokenOut: eurc,
        amountIn,
        minAmountOut: amountOut * 99n / 100n,
        to: user.address,
        deadline: Math.floor(Date.now() / 1000) + 3600
      });

      expect(await eurc.balanceOf(user.address)).to.be.gte(amountOut * 99n / 100n);
    });
  });
});
```

### Frontend Tests

```bash
cd frontend

# Run linter
npm run lint

# Type checking
npm run build
```

---

## Documentation

### Code Documentation

- Add JSDoc comments to functions
- Use NatSpec for Solidity
- Keep comments up to date with code changes

### README Updates

- Update feature lists when adding features
- Update installation instructions if dependencies change
- Add new environment variables to examples

### API Documentation

When adding new contract functions, document:
- Function purpose
- Parameters
- Return values
- Events emitted
- Example usage

---

## Project Structure

```
XyloNet/
├── contracts/                 # Smart contracts
│   ├── src/                   # Contract source files
│   ├── scripts/               # Deployment scripts
│   ├── test/                  # Contract tests
│   └── hardhat.config.js
│
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── config/            # Configuration
│   │   └── lib/               # Utilities
│   └── package.json
│
├── docs/                      # Additional documentation
├── README.md
├── CONTRIBUTING.md            # This file
├── SECURITY.md
└── LICENSE
```

---

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discord**: For general questions (link TBD)
- **Twitter**: For updates and announcements

---

## Recognition

Contributors will be:
- Added to the Contributors list in README
- Mentioned in release notes
- Eligible for future contributor rewards

---

## License

By contributing to XyloNet, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to XyloNet! Your efforts help make decentralized finance more accessible on Arc Network.
