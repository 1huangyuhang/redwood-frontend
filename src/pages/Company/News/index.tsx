import {
  Card,
  List,
  Typography,
  Row,
  Col,
  Pagination,
  Spin,
  Alert,
  Button,
} from 'antd';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import './index.less';
import axiosInstance from '../../../services/api/axiosInstance';
import {
  processImageUrl,
  handleImageError,
  handleImageLoad,
} from '../../../utils/imageUtils';
import { fetchAllPaginatedList } from '../../../utils/apiListResponse';

const { Title, Text, Paragraph } = Typography;

interface NewsItem {
  id: number;
  title: string;
  date: string;
  time: string;
  summary: string;
  image: string;
}

const News = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await fetchAllPaginatedList<Record<string, unknown>>(
        axiosInstance,
        '/news'
      );
      const formattedNews: NewsItem[] = rows.map((news) => ({
        id: news.id as number,
        title: String(news.title),
        date: String(news.date ?? ''),
        time: String(news.time ?? ''),
        summary: String(news.summary ?? news.content ?? ''),
        image: news.image != null ? String(news.image) : '',
      }));
      setNewsData(formattedNews);
    } catch (err) {
      setError('获取新闻数据失败，请稍后重试');
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  const start = (currentPage - 1) * pageSize;
  const pageItems = newsData.slice(start, start + pageSize);

  return (
    <div className="news-page">
      <div className="page-header">
        <Title level={1}>新闻动态</Title>
        <Text>了解公司最新动态和行业资讯</Text>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="加载中..." />
        </div>
      ) : error ? (
        <div className="error-container">
          <Alert
            message="暂时无法加载"
            description={error}
            type="error"
            showIcon
            action={
              <Button
                size="small"
                type="primary"
                onClick={() => void loadNews()}
              >
                重试
              </Button>
            }
          />
        </div>
      ) : (
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
                            src={processImageUrl(item.image)}
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
      )}
    </div>
  );
};

export default News;
