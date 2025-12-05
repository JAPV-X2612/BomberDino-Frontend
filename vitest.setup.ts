import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Avoid importing Phaser in tests by mocking the canvas-based component
vi.mock('@components/game/GameCanvas/GameCanvas', () => ({
  GameCanvas: () => null,
}));

// Ensure DOM is reset between tests
afterEach(() => {
  cleanup();
});
