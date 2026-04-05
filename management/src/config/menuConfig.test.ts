import { getBreadcrumbSegments, getBreadcrumbTitles } from './menuConfig';

describe('menuConfig breadcrumbs', () => {
  it('工作台为单段', () => {
    expect(getBreadcrumbSegments('/')).toEqual([{ title: '工作台' }]);
    expect(getBreadcrumbTitles('/')).toEqual(['工作台']);
  });

  it('产品页为分组+页；当前即分组 landing 时上级无重复链接', () => {
    const segs = getBreadcrumbSegments('/products');
    expect(segs).toHaveLength(2);
    expect(segs[0].title).toBe('内容运营');
    expect(segs[0].path).toBeUndefined();
    expect(segs[1]).toEqual({ title: '产品管理' });
  });

  it('新闻页上级 landing 为产品首页', () => {
    const segs = getBreadcrumbSegments('/news');
    expect(segs[0].path).toBe('/products');
    expect(segs[1].title).toBe('新闻管理');
  });

  it('未知路径回退占位', () => {
    expect(getBreadcrumbSegments('/unknown')).toEqual([{ title: '页面' }]);
  });
});
