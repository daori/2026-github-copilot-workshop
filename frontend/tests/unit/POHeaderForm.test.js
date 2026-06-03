import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import POHeaderForm from '../../src/components/POHeaderForm.vue';

describe('POHeaderForm', () => {
  it('renders fields and syncs v-model', async () => {
    const model = { supplier: '', date: '', currency: 'USD', notes: '' };
    const wrapper = mount(POHeaderForm, {
      props: { modelValue: model },
    });

    const supplier = wrapper.find('input[placeholder="Supplier name"]');
    await supplier.setValue('ACME Corp');

    // component emits update:modelValue via v-model binding
    const emitted = wrapper.emitted()['update:modelValue'];
    expect(emitted).toBeTruthy();
    const last = emitted[emitted.length - 1][0];
    expect(last.supplier).toBe('ACME Corp');
  });

  it('allows changing currency and notes', async () => {
    const model = { supplier: '', date: '', currency: 'USD', notes: '' };
    const wrapper = mount(POHeaderForm, { props: { modelValue: model } });

    const select = wrapper.find('select');
    await select.setValue('EUR');

    const ta = wrapper.find('textarea');
    await ta.setValue('Please expedite');

    const emitted = wrapper.emitted()['update:modelValue'];
    const last = emitted[emitted.length - 1][0];
    expect(last.currency).toBe('EUR');
    expect(last.notes).toBe('Please expedite');
  });
});
