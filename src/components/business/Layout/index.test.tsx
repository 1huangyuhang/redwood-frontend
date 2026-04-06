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

  test('keeps chrome spacer and --ly-chrome-stack-h constant when navigation hidden (no layout push)', async () => {
    renderLayout();
    window.scrollY = 100;
    fireEvent.scroll(window);
    await flushNavRaf();

    const spacer = document.querySelector('.site-chrome-spacer');
    expect(spacer).toHaveStyle({ height: '116px' });
    const top = document.querySelector('.top-layout') as HTMLElement;
    expect(top.style.getPropertyValue('--ly-chrome-stack-h')).toBe('116px');
    expect(document.querySelector('.site-chrome-shell')).toHaveClass(
      'nav-hidden'
    );
  });

  test('spacer height unchanged after scroll up shows navigation again', async () => {
    renderLayout();
    window.scrollY = 100;
    fireEvent.scroll(window);
    await flushNavRaf();
    window.scrollY = 50;
    fireEvent.scroll(window);
    await flushNavRaf();

    const spacer = document.querySelector('.site-chrome-spacer');
    expect(spacer).toHaveStyle({ height: '116px' });
    const top = document.querySelector('.top-layout') as HTMLElement;
    expect(top.style.getPropertyValue('--ly-chrome-stack-h')).toBe('116px');
    expect(document.querySelector('.site-chrome-shell')).not.toHaveClass(
      'nav-hidden'
    );
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

  test('home route uses same scroll-down-to-hide as other pages (no hero zone lock)', async () => {
    const hero = document.createElement('section');
    hero.className = 'home-hero-scrolly';
    document.body.appendChild(hero);

    try {
      renderLayoutAt('/');
      window.scrollY = 140;
      fireEvent.scroll(window);
      await flushNavRaf();

      const shell = document.querySelector('.site-chrome-shell');
      expect(shell).toHaveClass('nav-hidden');
    } finally {
      hero.remove();
    }
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
