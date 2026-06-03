<template>
  <div class="po-detail page">
    <div class="page-header">
      <div class="title-block">
        <h1>Purchase Order Detail</h1>
        <div class="subtitle">{{ po.poNumber || po.id }}</div>
      </div>
      <div class="page-actions">
        <RouterLink to="/purchase-orders">Back to list</RouterLink>
      </div>
    </div>

    <section class="card">
      <div class="grid">
        <div><strong>Vendor:</strong> {{ po.vendorName }}</div>
        <div><strong>Status:</strong> {{ po.status || 'DRAFT' }}</div>
        <div><strong>Created:</strong> {{ po.createdAt ? new Date(po.createdAt).toLocaleString() : '' }}</div>
      </div>

      <h3>Lines</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Code</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line, idx) in po.lines || []" :key="line.id || idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ line.itemName || line.description }}</td>
            <td>{{ line.itemCode }}</td>
            <td>{{ line.qtyOrdered || line.allocateQty || 0 }}</td>
            <td>{{ formatMoney(line.unitPrice || 0) }}</td>
            <td>{{ formatMoney((line.qtyOrdered || line.allocateQty || 0) * (line.unitPrice || 0)) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const id = route.params.id;
const po = ref({});

function formatMoney(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

onMounted(async () => {
  try {
    const data = await api.getPurchaseOrder(id);
    Object.assign(po, data);
  } catch (err) {
    console.error('Failed to load PO', err);
  }
});
</script>

<style scoped>
.grid { display:flex; gap:12px; margin-bottom:12px }
table { width:100%; border-collapse:collapse }
th, td { padding:8px; border:1px solid #eee }
.card { background:#fff; padding:12px; border:1px solid var(--border,#eee); border-radius:8px }
</style>
