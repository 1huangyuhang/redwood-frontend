import { Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/redux/slices/themeSlice';
import type { RootState } from '@/redux/store';

export default function ThemeToggle() {
  const mode = useSelector((s: RootState) => s.theme.mode);
  const dispatch = useDispatch();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? '切换为日间模式' : '切换为夜间模式'}>
      <button
        type="button"
        className="top-bar-icon-btn theme-toggle-btn"
        onClick={() => dispatch(toggleTheme())}
        aria-label={isDark ? '切换到日间模式' : '切换到夜间模式'}
        aria-pressed={isDark}
      >
        {isDark ? <SunOutlined aria-hidden /> : <MoonOutlined aria-hidden />}
      </button>
    </Tooltip>
  );
}
