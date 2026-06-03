<template>
  <section class="line-table card">
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Code</th>
          <th>PR Ref</th>
          <th>Remaining</th>
          <th>Allocate Qty</th>
          <th>UOM</th>
          <th>Unit Price</th>
          <th>Site</th>
          <th>Req Date</th>
          <th>Line Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(line, idx) in localLines" :key="line.id || idx" :class="{ invalid: line.allocateQty > (line.remainingQty || 0) }">
          <td><input v-model="line.description" placeholder="Item description" /></td>
          <td><input v-model="line.itemCode" placeholder="SKU" /></td>
          <td><input v-model="line.prRef" placeholder="PR-123" /></td>
          <td>{{ line.remainingQty ?? 0 }}</td>
          <td>
            <input type="number" min="0" v-model.number="line.allocateQty" />
          </td>
          <td><input v-model="line.uom" placeholder="pcs" style="width:80px" /></td>
          <td><input type="number" min="0" step="0.01" v-model.number="line.unitPrice" /></td>
          <td><input v-model="line.siteCode" placeholder="MAIN" style="width:90px" /></td>
          <td><input type="date" v-model="line.requiredDate" /></td>
          <td>{{ formatMoney((line.allocateQty||0) * (line.unitPrice||0)) }}</td>
          <td>
            <button @click.prevent="removeLine(idx)">Remove</button>
            <div v-if="line.allocateQty > (line.remainingQty || 0)" class="note">Alloc > remaining</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="table-actions">
      <button class="primary" @click.prevent="addLine">Add line</button>
      <div class="totals">Total: {{ formatMoney(total) }}</div>
    </div>
  </section>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

const localLines = reactive((props.modelValue || []).map((l) => ({ ...l })));
let _syncing = false;
watch(
  () => props.modelValue,
  (v) => {
    _syncing = true;
    // sync shallow
    localLines.splice(0, localLines.length, ...(v || []).map((l) => ({ ...l })));
    _syncing = false;
  },
  { deep: true }
);

watch(
  localLines,
  (v) => {
    if (_syncing) return;
    // emit an immutable shallow copy to avoid sharing reactive references
    emit('update:modelValue', (v || []).map((l) => ({ ...l })));
  },
  { deep: true }
);

function addLine() {
  localLines.push({ description: '', itemCode: '', prRef: '', remainingQty: 0, allocateQty: 0, unitPrice: 0, uom: 'pcs', siteCode: 'MAIN', requiredDate: '' });
}

function removeLine(idx) {
  localLines.splice(idx, 1);
}

const total = computed(() => localLines.reduce((s, l) => s + (l.allocateQty || 0) * (l.unitPrice || 0), 0));

function formatMoney(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}
</script>

<style scoped>
.line-table table { width:100%; border-collapse:collapse; margin-bottom:8px }
.line-table table { width:100%; border-collapse:collapse; margin-bottom:8px }
.line-table th, .line-table td { border:1px solid #f1f1f1; padding:8px; text-align:left }
.table-actions { display:flex; justify-content:space-between; align-items:center }
.totals { font-weight:700 }
button { padding:6px 10px }
.primary { background:var(--primary,#2563eb); color:white; border:none; border-radius:6px }
.note { color:var(--danger,#b91c1c); font-size:12px; margin-top:6px }
.invalid { background: rgba(185,28,28,0.03) }
input[type=number] { width:100px }
.card { background:#fff; border:1px solid var(--border,#eee); padding:12px; border-radius:8px }
</style>
