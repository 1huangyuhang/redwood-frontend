import { TicketStatus } from '@prisma/client';
import {
  patchSupportTicketSchema,
  supportTicketQuerySchema,
} from '../../src/schemas/supportTicketSchema';

describe('supportTicketSchema (unit)', () => {
  it('patch accepts TicketStatus enum values', () => {
    for (const status of Object.values(TicketStatus)) {
      const r = patchSupportTicketSchema.safeParse({ status });
      expect(r.success).toBe(true);
    }
  });

  it('patch rejects arbitrary status string', () => {
    const r = patchSupportTicketSchema.safeParse({ status: 'open' });
    expect(r.success).toBe(false);
  });

  it('query parses optional status filter', () => {
    const r = supportTicketQuerySchema.parse({
      page: '1',
      pageSize: '10',
      status: 'OPEN',
    });
    expect(r.status).toBe('OPEN');
  });
});
