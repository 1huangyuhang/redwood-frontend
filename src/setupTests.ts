import '@testing-library/jest-dom';

// Ant Design / rc-resize-observer 依赖；jsdom 未提供
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).ResizeObserver = ResizeObserverStub;

// 可以在这里添加全局测试设置
