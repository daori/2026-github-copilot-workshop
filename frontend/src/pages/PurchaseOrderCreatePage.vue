<template>
  <div class="po-create page">
    <div class="page-header">
      <div class="title-block">
        <h1>Create Purchase Order</h1>
        <div class="subtitle">New purchase order — fill header and allocate lines</div>
      </div>
      <div class="page-actions">
        <button class="secondary" @click="validateAndSave">Save</button>
        <button class="primary" :disabled="!canSubmit" @click="submit">Submit</button>
      </div>
    </div>

    <POHeaderForm v-model="header" />

    <LineAllocationTable v-model="lines" />

    <div class="actions">
      <div class="summary">Grand Total: {{ formatMoney(grandTotal) }}</div>
    </div>

    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { api } from '../api';
import POHeaderForm from '../components/POHeaderForm.vue';
import LineAllocationTable from '../components/LineAllocationTable.vue';

const header = ref({ supplier: '', date: '', currency: 'USD', notes: '' });
const lines = ref([]);

const grandTotal = computed(() => lines.value.reduce((s, l) => s + (l.allocateQty || 0) * (l.unitPrice || 0), 0));

const hasInvalidAllocation = computed(() => lines.value.some((l) => (l.allocateQty || 0) > (l.remainingQty || 0)));
const canSubmit = computed(() => !!header.value.supplier && lines.value.length > 0 && !hasInvalidAllocation.value);

function formatMoney(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: header.value.currency || 'USD' }).format(v);
}

function safeAlert(msg) {
  if (typeof alert === 'function') alert(msg);
  else console.log('ALERT:', msg);
}

function validateAndSave() {
  // Basic validation: supplier and at least one line
  if (!header.value.supplier) {
    safeAlert('Please enter supplier');
    return;
  }
  if (!lines.value.length) {
    safeAlert('Please add at least one line');
    return;
  }
  // Frontend over-allocation guard (uses line.remainingQty if available)
  const allocErrors = [];
  lines.value.forEach((l, idx) => {
    const alloc = Number(l.allocateQty || 0);
    const remaining = Number(l.remainingQty || 0);
    if (alloc > remaining) {
      allocErrors.push(`lines[${idx}]: allocation qty ${alloc} exceeds remaining ${remaining}`);
    }
  });
  if (allocErrors.length) {
    safeAlert('Allocation validation failed:\n' + allocErrors.join('\n'));
    return;
  }

  // Build payload expected by backend
  const payload = {
    vendorName: header.value.supplier,
    lines: lines.value.map((l) => ({
      prLineId: l.prLineId || l.prRef,
      itemCode: l.itemCode,
      itemName: l.description,
      uom: l.uom,
      siteCode: l.siteCode,
      qtyOrdered: Number(l.allocateQty || 0),
      unitPrice: Number(l.unitPrice || 0),
      requiredDate: l.requiredDate || header.value.date || null,
    })),
  };

  api.createPurchaseOrder(payload)
    .then((po) => {
      safeAlert('Purchase Order created (draft)');
      console.log('created PO', po);
    })
    .catch((err) => {
      safeAlert('Failed to create PO: ' + (err.message || String(err)));
      console.error(err);
    });
}

function submit() {
  if (!canSubmit.value) {
    safeAlert('Cannot submit: fix validation first');
    return;
  }
  // Create PO then submit it
  const payload = {
    vendorName: header.value.supplier,
    lines: lines.value.map((l) => ({
      prLineId: l.prLineId || l.prRef,
      itemCode: l.itemCode,
      itemName: l.description,
      uom: l.uom,
      siteCode: l.siteCode,
      qtyOrdered: Number(l.allocateQty || 0),
      unitPrice: Number(l.unitPrice || 0),
      requiredDate: l.requiredDate || header.value.date || null,
    })),
  };

  (async () => {
    try {
      const created = await api.createPurchaseOrder(payload);
      // submit
      try {
        const submitted = await api.submitPurchaseOrder(created.id);
        safeAlert('PO submitted: ' + (submitted.poNumber || created.id));
        console.log('submitted PO', submitted);
      } catch (err) {
        safeAlert('Submit failed: ' + (err.message || String(err)));
        console.error(err);
      }
    } catch (err) {
      // creation failed (possibly validation 422)
      safeAlert('Submit failed: ' + (err.message || String(err)));
      console.error(err);
    }
  })();
}
</script>

<style scoped>
.po-create { max-width:980px; margin:0 auto; padding:20px }
.page-header { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:16px }
.title-block h1 { margin:0 }
.subtitle { color:#666; font-size:13px }
.page-actions button { margin-left:8px }
.actions { display:flex; justify-content:flex-end; align-items:center; margin-top:12px }
.summary { font-weight:700 }
.debug { margin-top:16px; background:#f8f8f8; padding:8px; border-radius:6px }
.primary { background:var(--primary,#2563eb); color:white; border:none; padding:8px 12px; border-radius:6px }
.secondary { background:transparent; border:1px solid var(--border,#cfcfd0); padding:7px 10px; border-radius:6px }
.primary:disabled { opacity:0.5 }
</style>
