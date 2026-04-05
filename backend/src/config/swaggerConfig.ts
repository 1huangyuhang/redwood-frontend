import swaggerJSDoc from 'swagger-jsdoc';

// Swagger配置选项
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '企业管理系统API',
      description: '企业管理系统的RESTful API文档',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '本地开发环境',
      },
    ],
    tags: [
      { name: 'Auth', description: '登录与账号（公开 POST；GET /me 需 JWT）' },
      { name: 'Stats', description: '管理端聚合统计' },
      {
        name: 'Content',
        description: '产品 / 活动 / 新闻 / 素材 / 课程 / 套餐',
      },
      {
        name: 'CRM',
        description: '留言与工单（部分 POST 为官网公开，其余需管理认证）',
      },
    ],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: '管理端登录',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['identifier', 'password'],
                  properties: {
                    identifier: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: '成功，返回 data 内含 accessToken 等',
            },
            '429': { description: 'RATE_LIMIT_LOGIN' },
          },
        },
      },
      '/api/stats/summary': {
        get: {
          tags: ['Stats'],
          summary: '工作台统计',
          responses: {
            '200': {
              description: '{ data: { productCount, ... } }',
            },
          },
        },
      },
      '/api/categories': {
        get: {
          tags: ['Content'],
          summary: '商品类目列表（管理端下拉）',
          responses: {
            '200': {
              description: '{ data: Category[] }',
            },
          },
        },
      },
      '/api/products': {
        get: {
          tags: ['Content'],
          summary: '产品分页列表',
          responses: {
            '200': {
              description: '{ data: Product[], pagination }',
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API密钥认证',
        },
      },
      schemas: {
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            slug: { type: 'string', example: 'hongmu-jiaju' },
            name: { type: 'string', example: '红木家具' },
            sortOrder: { type: 'integer', example: 0 },
          },
        },
        // 产品 JSON 响应（列表/详情）：类目外键 + 媒体双轨
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '产品ID',
              example: 1,
            },
            name: {
              type: 'string',
              description: '产品名称',
              example: '产品名称',
            },
            price: {
              type: 'number',
              description: '产品价格',
              example: 100.0,
            },
            categoryId: {
              type: 'integer',
              description: '类目 ID（外键 Category）',
              example: 1,
            },
            category: {
              type: 'string',
              description: '类目展示名称（关联查询）',
              example: '红木家具',
            },
            image: {
              type: 'string',
              nullable: true,
              description:
                '无 imageUrl 时为 JPEG Base64；有 imageUrl 时为 null',
            },
            imageUrl: {
              type: 'string',
              nullable: true,
              description: '外链优先；存在时 image 为 null',
              example: 'https://cdn.example.com/p/1.jpg',
            },
            isNew: {
              type: 'boolean',
              description: '是否新品',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2024-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
              example: '2024-01-01T00:00:00Z',
            },
          },
          required: [
            'id',
            'name',
            'price',
            'categoryId',
            'category',
            'image',
            'imageUrl',
            'isNew',
            'createdAt',
            'updatedAt',
          ],
        },
        // 活动模式
        Activity: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '活动ID',
              example: 1,
            },
            title: {
              type: 'string',
              description: '活动标题',
              example: '活动标题',
            },
            description: {
              type: 'string',
              description: '活动描述',
              example: '活动描述内容',
            },
            image: {
              type: 'string',
              nullable: true,
              description: '无 imageUrl 时为 Base64；有 imageUrl 时为 null',
            },
            imageUrl: {
              type: 'string',
              nullable: true,
              description: '外链优先',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2024-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
              example: '2024-01-01T00:00:00Z',
            },
          },
          required: ['title', 'description'],
        },
        // 新闻模式
        News: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '新闻ID',
              example: 1,
            },
            title: {
              type: 'string',
              description: '新闻标题',
              example: '新闻标题',
            },
            content: {
              type: 'string',
              description: '新闻内容',
              example: '新闻内容',
            },
            summary: {
              type: 'string',
              description: '新闻摘要',
              example: '新闻摘要',
            },
            date: {
              type: 'string',
              format: 'date',
              description: '新闻日期',
              example: '2024-01-01',
            },
            time: {
              type: 'string',
              description: '新闻时间',
              example: '10:00',
            },
            image: {
              type: 'string',
              nullable: true,
              description: '无 imageUrl 时为 Base64；有 imageUrl 时为 null',
            },
            imageUrl: {
              type: 'string',
              nullable: true,
              description: '外链优先',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2024-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
              example: '2024-01-01T00:00:00Z',
            },
          },
          required: ['title', 'content', 'summary', 'date', 'time'],
        },
      },
    },
  },
  // 指定API路由文件的路径
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

// 生成Swagger规范
const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
