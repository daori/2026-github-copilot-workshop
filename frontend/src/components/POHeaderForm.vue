<template>
  <section class="po-header card">
    <div class="grid">
      <div class="field">
        <label>Supplier</label>
        <input v-model="local.supplier" placeholder="Supplier name" />
      </div>

      <div class="field">
        <label>Order Date</label>
        <input type="date" v-model="local.date" />
      </div>

      <div class="field">
        <label>Currency</label>
        <select v-model="local.currency">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="IDR">IDR</option>
        </select>
      </div>

      <div class="field full">
        <label>Notes</label>
        <textarea v-model="local.notes" rows="3" placeholder="Optional notes"></textarea>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Object, default: () => ({ supplier: '', date: '', currency: 'USD', notes: '' }) }
});
const emit = defineEmits(['update:modelValue']);

const local = reactive({ ...props.modelValue });
let _syncing = false;
watch(
  () => props.modelValue,
  (v) => {
    _syncing = true;
    Object.assign(local, v || {});
    _syncing = false;
  },
  { deep: true }
);

watch(
  local,
  (v) => {
    if (_syncing) return;
    emit('update:modelValue', v);
  },
  { deep: true }
);
</script>

<style scoped>
.card { background: #fff; border: 1px solid var(--border, #e6e6e6); padding: 16px; border-radius:8px }
.po-header { display:block }
.grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px }
.field { display:flex; flex-direction:column }
.field.full { grid-column: 1 / -1 }
label { font-weight:600; margin-bottom:6px; color:var(--text-strong,#222) }
input, select, textarea { padding:8px; border:1px solid var(--border,#ddd); border-radius:6px; background:var(--input-bg,#fff) }
</style>
