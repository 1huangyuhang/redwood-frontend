import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import store from '@/redux/store';
import Layout from './index';

const renderLayout = () =>
  render(
    <Provider store={store}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </Provider>
  );

const renderLayoutAt = (path: string) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Layout />
      </MemoryRouter>
    </Provider>
  );

/** 等待 Layout 内 requestAnimationFrame 中的导航显隐更新 */
async function flushNavRaf() {
  await act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  });
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

Object.defineProperty(window, 'scrollY', {
  writable: true,
  configurable: true,
  value: 0,
});

describe('Layout Component - Scroll Interaction', () => {
  beforeEach(() => {
    window.scrollY = 0;
  });

  test('should render Layout component correctly', () => {
    renderLayout();
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('商店')).toBeInTheDocument();
  });

  test('should show navigation bar when scrollY is 0', async () => {
    renderLayout();
    window.scrollY = 0;
    fireEvent.scroll(window);
    await flushNavRaf();

    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveClass('nav-bar');
    expect(navBar).not.toHaveClass('nav-hidden');
  });

  test('should hide navigation bar when scrolling down', async () => {
    renderLayout();
    window.scrollY = 100;
    fireEvent.scroll(window);
    await flushNavRaf();

    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveClass('nav-hidden');
  });

  test('should show navigation bar when scrolling up', async () => {
    renderLayout();
    window.scrollY = 100;
    fireEvent.scroll(window);
    await flushNavRaf();

    window.scrollY = 50;
    fireEvent.scroll(window);
    await flushNavRaf();

    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveClass('nav-bar');
    expect(navBar).not.toHaveClass('nav-hidden');
  });

  test('should show navigation bar on initial load', () => {
    renderLayout();
    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveClass('nav-bar');
    expect(navBar).not.toHaveClass('nav-hidden');
  });

  test('should keep navigation visible when scroll position unchanged', async () => {
    renderLayout();
    window.scrollY = 0;
    fireEvent.scroll(window);
    await flushNavRaf();
    window.scrollY = 0;
    fireEvent.scroll(window);
    await flushNavRaf();

    const navBar = document.querySelector('.nav-bar');
    expect(navBar).not.toHaveClass('nav-hidden');
  });

  test('sets data-home-atop-hero on home at scroll top for transparent chrome shell', async () => {
    renderLayoutAt('/');
    await act(async () => {
      await Promise.resolve();
    });
    const top = document.querySelector('.top-layout') as HTMLElement | null;
    expect(top).toHaveAttribute('data-home-atop-hero');
    const blend = top?.style.getPropertyValue('--chrome-media-blend') ?? '';
    expect(parseFloat(blend)).toBeGreaterThanOrEqual(0.99);
    const clear = top?.style.getPropertyValue('--chrome-shell-clear') ?? '';
    expect(parseFloat(clear)).toBeGreaterThanOrEqual(0.99);
  });

  test('does not set data-home-atop-hero off home route', async () => {
    renderLayoutAt('/shop');
    await act(async () => {
      await Promise.resolve();
    });
    const top = document.querySelector('.top-layout') as HTMLElement | null;
    expect(top).not.toHaveAttribute('data-home-atop-hero');
    expect(
      parseFloat(top?.style.getPropertyValue('--chrome-shell-clear') ?? '0')
    ).toBe(0);
  });
});

describe('Layout Component - Responsive Design', () => {
  test('should apply mobile styles when viewport is small', async () => {
    renderLayout();

    await act(async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
      fireEvent.resize(window);
    });

    await waitFor(() => {
      const navBar = document.querySelector('.nav-bar');
      expect(navBar).toHaveStyle({ height: '48px' });
    });
  });

  test('should apply desktop styles when viewport is large', async () => {
    renderLayout();

    await act(async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });
      fireEvent.resize(window);
    });

    await waitFor(() => {
      const navBar = document.querySelector('.nav-bar');
      expect(navBar).toHaveStyle({ height: '64px' });
    });
  });
});
