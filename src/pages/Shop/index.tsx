import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import ShopView from './ShopView';
import './index.less';

export default function Shop() {
  return (
    <MarketingPageShell
      pageClass="shop-page"
      wide
      title={<h1>红木产品展示</h1>}
      lead={<p>精选优质红木产品，为您的生活增添雅致</p>}
    >
      <ShopView />
    </MarketingPageShell>
  );
}
