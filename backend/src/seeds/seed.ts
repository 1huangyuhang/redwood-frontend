import prisma from '../utils/prisma';

async function main() {
  await prisma.category.createMany({
    data: [
      { slug: 'hongmu-gongyipin', name: '红木工艺品', sortOrder: 0 },
      { slug: 'hongmu-jiaju', name: '红木家具', sortOrder: 1 },
      { slug: 'hongmu-shuzhuo', name: '红木书桌', sortOrder: 2 },
      { slug: 'hongmu-chaju', name: '红木茶具', sortOrder: 3 },
      { slug: 'hongmu-zhuangshi', name: '红木装饰', sortOrder: 4 },
    ],
    skipDuplicates: true,
  });

  const cats = await prisma.category.findMany();
  const cid = (name: string) => {
    const c = cats.find((x) => x.name === name);
    if (!c) throw new Error(`Seed: category not found: ${name}`);
    return c.id;
  };

  await prisma.product.createMany({
    data: [
      {
        name: '红木工艺品参照',
        price: 1.0,
        categoryId: cid('红木工艺品'),
        image: null,
        isNew: false,
      },
      {
        name: '参照物品',
        price: 30.0,
        categoryId: cid('红木家具'),
        image: null,
        isNew: true,
      },
      {
        name: '红木书桌',
        price: 12800.0,
        categoryId: cid('红木书桌'),
        image: null,
        isNew: false,
      },
      {
        name: '红木茶具',
        price: 2800.0,
        categoryId: cid('红木茶具'),
        image: null,
        isNew: false,
      },
      {
        name: '红木装饰',
        price: 1500.0,
        categoryId: cid('红木装饰'),
        image: null,
        isNew: false,
      },
      {
        name: '红木家具套装',
        price: 25800.0,
        categoryId: cid('红木家具'),
        image: null,
        isNew: false,
      },
      {
        name: '红木餐桌',
        price: 18800.0,
        categoryId: cid('红木家具'),
        image: null,
        isNew: false,
      },
      {
        name: '红木椅',
        price: 3800.0,
        categoryId: cid('红木家具'),
        image: null,
        isNew: false,
      },
    ],
  });

  await prisma.activity.createMany({
    data: [
      {
        title: '红木文化节',
        description: '参加红木文化节，了解红木文化的魅力',
        image: null,
      },
      {
        title: '红木工艺展示',
        description: '展示精湛的红木工艺',
        image: null,
      },
      {
        title: '红木家具展览',
        description: '参观最新款红木家具',
        image: null,
      },
      {
        title: '红木原材料展示',
        description: '了解红木原材料的来源和品质',
        image: null,
      },
    ],
  });

  await prisma.news.createMany({
    data: [
      {
        title: '公司新产品发布会圆满成功',
        date: '2024-12-10',
        time: '14:30',
        summary:
          '我们公司于12月10日成功举办了新产品发布会，吸引了众多行业专家和媒体的关注。发布会上，我们展示了最新研发的红木家具系列，获得了广泛好评。',
        content:
          '我们公司于12月10日成功举办了新产品发布会，吸引了众多行业专家和媒体的关注。发布会上，我们展示了最新研发的红木家具系列，获得了广泛好评。',
        image: null,
      },
      {
        title: '公司荣获年度优秀企业称号',
        date: '2024-11-25',
        time: '09:15',
        summary:
          '在刚刚结束的行业评选中，我们公司凭借卓越的产品质量和服务，荣获了年度优秀企业称号。这是对我们多年来努力的肯定，也是对未来发展的激励。',
        content:
          '在刚刚结束的行业评选中，我们公司凭借卓越的产品质量和服务，荣获了年度优秀企业称号。这是对我们多年来努力的肯定，也是对未来发展的激励。',
        image: null,
      },
      {
        title: '红木行业发展趋势研讨会顺利召开',
        date: '2024-11-18',
        time: '13:45',
        summary:
          '我们公司作为主办方，成功举办了红木行业发展趋势研讨会。会上，来自全国各地的专家学者就红木行业的未来发展方向进行了深入探讨，分享了最新的研究成果和市场动态。',
        content:
          '我们公司作为主办方，成功举办了红木行业发展趋势研讨会。会上，来自全国各地的专家学者就红木行业的未来发展方向进行了深入探讨，分享了最新的研究成果和市场动态。',
        image: null,
      },
      {
        title: '公司与知名设计师达成合作',
        date: '2024-11-05',
        time: '10:20',
        summary:
          '为了进一步提升产品设计水平，我们公司与国际知名设计师团队达成了长期合作协议。这将有助于我们推出更多具有创新性和竞争力的产品，满足市场需求。',
        content:
          '为了进一步提升产品设计水平，我们公司与国际知名设计师团队达成了长期合作协议。这将有助于我们推出更多具有创新性和竞争力的产品，满足市场需求。',
        image: null,
      },
      {
        title: '公司新工厂正式投产',
        date: '2024-10-28',
        time: '11:00',
        summary:
          '经过一年多的建设，我们公司的新工厂正式投产。新工厂采用了先进的生产设备和环保工艺，将大大提高我们的生产能力和产品质量，为公司的快速发展奠定坚实基础。',
        content:
          '经过一年多的建设，我们公司的新工厂正式投产。新工厂采用了先进的生产设备和环保工艺，将大大提高我们的生产能力和产品质量，为公司的快速发展奠定坚实基础。',
        image: null,
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
