import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LineAllocationTable from '../../src/components/LineAllocationTable.vue';

describe('LineAllocationTable', () => {
  it('renders provided lines and computes total', () => {
    const lines = [
      { description: 'A', itemCode: 'A1', prRef: 'pr-1', remainingQty: 5, allocateQty: 2, unitPrice: 100 },
      { description: 'B', itemCode: 'B1', prRef: 'pr-2', remainingQty: 3, allocateQty: 1, unitPrice: 200 },
    ];

    const wrapper = mount(LineAllocationTable, { props: { modelValue: lines } });

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    expect(wrapper.text()).toContain('Total:');
    // total should be 2*100 + 1*200 = 400
    expect(wrapper.text()).toContain('400');
  });

  it('marks row invalid when allocate exceeds remaining', async () => {
    const lines = [{ description: 'X', prRef: 'pr-1', remainingQty: 2, allocateQty: 5, unitPrice: 10 }];
    const wrapper = mount(LineAllocationTable, { props: { modelValue: lines } });

    const row = wrapper.find('tbody tr');
    expect(row.classes()).toContain('invalid');
    expect(wrapper.text()).toContain('Alloc > remaining');
  });

  it('adds a line when clicking add', async () => {
    const wrapper = mount(LineAllocationTable, { props: { modelValue: [] } });
    await wrapper.find('button.primary').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
  });
});
