import { Card, Row, Col, Typography, Tag, Spin, Alert } from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import {
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarFilled,
} from '@ant-design/icons';
import { handleImageError, handleImageLoad } from '@/utils/imageUtils';
import { mediaDisplaySrc } from '@/types/dto';
import { useCoursesPage } from './useCoursesPage';

const { Title, Text, Paragraph } = Typography;

export default function CoursesView() {
  const { courses, loading, error, loadCourses } = useCoursesPage();

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="暂时无法加载"
        description={error}
        type="error"
        showIcon
        action={
          <SiteButton
            size="sm"
            variant="primary"
            onClick={() => void loadCourses()}
          >
            重试
          </SiteButton>
        }
      />
    );
  }

  if (courses.length === 0) {
    return <Alert message="暂无课程" type="info" showIcon />;
  }

  return (
    <Row gutter={[24, 24]} className="courses-grid">
      {courses.map((course) => (
        <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
          <Card className="course-card">
            <div className="course-image-wrapper">
              <img
                src={mediaDisplaySrc(course)}
                alt={course.title}
                className="course-image"
                loading="lazy"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
            <div className="course-info">
              <div className="course-meta">
                <div className="meta-item">
                  <UserOutlined className="meta-icon" />
                  <Text className="meta-text">{course.instructor}</Text>
                </div>
                <div className="meta-item">
                  <ClockCircleOutlined className="meta-icon" />
                  <Text className="meta-text">{course.duration}</Text>
                </div>
                <div className="meta-item">
                  <BookOutlined className="meta-icon" />
                  <Text className="meta-text">{course.students}人学习</Text>
                </div>
              </div>

              <Title level={3} className="course-title">
                {course.title}
              </Title>

              <div className="course-rating">
                {[...Array(5)].map((_, index) => (
                  <StarFilled
                    key={index}
                    className={`rating-star ${index < Math.floor(course.rating) ? 'filled' : ''}`}
                  />
                ))}
                <Text className="rating-text">{course.rating}</Text>
              </div>

              <Paragraph className="course-description">
                {course.description}
              </Paragraph>

              <div className="course-tags">
                {course.tags.map((tag, index) => (
                  <Tag key={index} className="course-tag">
                    {tag}
                  </Tag>
                ))}
              </div>

              <div className="course-footer">
                <div className="course-price">¥{course.price}</div>
                <SiteButton variant="primary" className="enroll-btn">
                  立即报名
                </SiteButton>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
