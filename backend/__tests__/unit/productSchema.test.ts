import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../../src/schemas/productSchema';

describe('productSchema (unit)', () => {
  describe('createProductSchema', () => {
    it('accepts categoryId + required fields', () => {
      const r = createProductSchema.safeParse({
        name: 'A',
        price: 10,
        categoryId: 1,
        isNew: false,
      });
      expect(r.success).toBe(true);
    });

    it('accepts category string instead of categoryId', () => {
      const r = createProductSchema.safeParse({
        name: 'B',
        price: '12.5',
        category: '家具',
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.price).toBe(12.5);
      }
    });

    it('rejects when neither categoryId nor category', () => {
      const r = createProductSchema.safeParse({
        name: 'C',
        price: 1,
      });
      expect(r.success).toBe(false);
    });

    it('rejects empty name', () => {
      const r = createProductSchema.safeParse({
        name: '',
        price: 1,
        categoryId: 1,
      });
      expect(r.success).toBe(false);
    });

    it('rejects non-positive price', () => {
      const r = createProductSchema.safeParse({
        name: 'D',
        price: 0,
        categoryId: 1,
      });
      expect(r.success).toBe(false);
    });
  });

  describe('updateProductSchema', () => {
    it('allows partial update', () => {
      const r = updateProductSchema.safeParse({ name: 'OnlyName' });
      expect(r.success).toBe(true);
    });
  });

  describe('productQuerySchema', () => {
    it('defaults page and pageSize', () => {
      const r = productQuerySchema.parse({});
      expect(r.page).toBe(1);
      expect(r.pageSize).toBe(10);
    });

    it('parses query strings', () => {
      const r = productQuerySchema.parse({
        page: '2',
        pageSize: '20',
        search: 'foo',
      });
      expect(r.page).toBe(2);
      expect(r.pageSize).toBe(20);
      expect(r.search).toBe('foo');
    });
  });
});
