import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PurchaseOrderCreatePage from '../../src/pages/PurchaseOrderCreatePage.vue';

// Mock API module
vi.mock('../../src/api', () => ({
  api: {
    createPurchaseOrder: vi.fn(async (p) => ({ id: 'po-1', poNumber: 'PO-2026-0001', ...p })),
    submitPurchaseOrder: vi.fn(async (id) => ({ id, poNumber: 'PO-2026-0001', status: 'SUBMITTED' })),
  },
}));

describe('PurchaseOrderCreatePage', () => {
  it('disables submit when no supplier or lines', () => {
    const wrapper = mount(PurchaseOrderCreatePage, { global: { stubs: ['POHeaderForm', 'LineAllocationTable'] } });
    const submitBtn = wrapper.find('button.primary');
    expect(submitBtn.attributes('disabled')).toBeDefined();
  });

  it('calls API create on Save with mapped payload', async () => {
    const { api } = await import('../../src/api');

    const wrapper = mount(PurchaseOrderCreatePage, { global: { stubs: ['POHeaderForm', 'LineAllocationTable'] } });

    // set component state directly to avoid exercising child DOM (v-model cycles)
    wrapper.vm.header.supplier = 'ACME Corp';
    wrapper.vm.lines = [
      { description: 'Widget', itemCode: 'W1', prRef: 'pr-1', remainingQty: 5, allocateQty: 3, unitPrice: 100, uom: 'pcs', siteCode: 'MAIN', requiredDate: '' },
    ];

    // Click Save (secondary button in header)
    const saveBtn = wrapper.find('button.secondary');
    await saveBtn.trigger('click');

    expect(api.createPurchaseOrder).toHaveBeenCalled();
    const calledWith = api.createPurchaseOrder.mock.calls[0][0];
    expect(calledWith.vendorName).toBe('ACME Corp');
    expect(calledWith.lines.length).toBeGreaterThan(0);
    expect(calledWith.lines[0].itemName).toBe('Widget');
  });

  it('performs create+submit on Submit click when valid', async () => {
    const { api } = await import('../../src/api');

    const wrapper = mount(PurchaseOrderCreatePage);

    // set component state directly
    wrapper.vm.header.supplier = 'ACME Corp';
    wrapper.vm.lines = [
      { description: 'Widget', itemCode: 'W1', prRef: 'pr-1', remainingQty: 5, allocateQty: 1, unitPrice: 100, uom: 'pcs', siteCode: 'MAIN', requiredDate: '' },
    ];

    // Call submit directly to avoid child DOM/reactivity in unit test
    await wrapper.vm.submit();

    // createPurchaseOrder and submitPurchaseOrder should be called
    expect(api.createPurchaseOrder).toHaveBeenCalled();
    expect(api.submitPurchaseOrder).toHaveBeenCalled();
  });
});
