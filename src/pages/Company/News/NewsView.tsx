import {
  Card,
  List,
  Typography,
  Row,
  Col,
  Pagination,
  Spin,
  Alert,
} from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { handleImageError, handleImageLoad } from '@/utils/imageUtils';
import { mediaDisplaySrc } from '@/types/dto';
import { useNewsPage } from './useNewsPage';

const { Title, Text, Paragraph } = Typography;

export default function NewsView() {
  const {
    newsData,
    loading,
    error,
    loadNews,
    currentPage,
    pageSize,
    pageItems,
    handlePageChange,
    handlePageSizeChange,
  } = useNewsPage();

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert
          message="暂时无法加载"
          description={error}
          type="error"
          showIcon
          action={
            <SiteButton
              size="sm"
              variant="primary"
              onClick={() => void loadNews()}
            >
              重试
            </SiteButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="news-content">
        <List
          grid={{ gutter: 24, column: 1 }}
          dataSource={pageItems}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Card hoverable className="news-card">
                <Row gutter={[24, 0]} align="stretch">
                  <Col xs={24} md={8}>
                    <div className="news-image-wrapper">
                      <img
                        src={mediaDisplaySrc(item)}
                        alt={item.title}
                        className="news-image"
                        loading="lazy"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                      />
                    </div>
                  </Col>
                  <Col xs={24} md={16}>
                    <div className="news-info">
                      <div className="news-meta">
                        <CalendarOutlined className="meta-icon" />
                        <Text className="meta-text">{item.date}</Text>
                        <ClockCircleOutlined className="meta-icon" />
                        <Text className="meta-text">{item.time}</Text>
                      </div>
                      <Title level={3} className="news-title">
                        {item.title}
                      </Title>
                      <Paragraph className="news-summary">
                        {item.summary}
                      </Paragraph>
                      <div className="news-actions">
                        <Text className="read-more">阅读全文</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </List.Item>
          )}
        />
      </div>

      <div className="pagination-container">
        <Pagination
          current={currentPage}
          total={newsData.length}
          pageSize={pageSize}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `共 ${total} 条记录`}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
        />
      </div>
    </>
  );
}
