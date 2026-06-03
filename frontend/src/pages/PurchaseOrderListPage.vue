<template>
  <div class="po-list page">
    <div class="page-header">
      <div class="title-block">
        <h1>Purchase Orders</h1>
        <div class="subtitle">List of purchase orders</div>
      </div>
      <div class="page-actions">
        <RouterLink class="primary" to="/purchase-orders/new">Create PO</RouterLink>
      </div>
    </div>

    <section class="card">
      <table>
        <thead>
          <tr>
            <th>PO #</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Lines</th>
            <th>Total</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="po in purchaseOrders" :key="po.id">
            <td>{{ po.poNumber || po.id }}</td>
            <td>{{ po.vendorName }}</td>
            <td>{{ po.status || 'DRAFT' }}</td>
            <td>{{ po.lines ? po.lines.length : 0 }}</td>
            <td>{{ formatMoney(po.lines ? po.lines.reduce((s,l)=>s+(l.qtyOrdered||0)*(l.unitPrice||0),0) : 0) }}</td>
            <td>{{ po.createdAt ? new Date(po.createdAt).toLocaleDateString() : '' }}</td>
            <td><RouterLink :to="`/purchase-orders/${po.id}`">View</RouterLink></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api';
import { RouterLink } from 'vue-router';

const purchaseOrders = ref([]);

function formatMoney(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

onMounted(async () => {
  try {
    const list = await api.listPurchaseOrders();
    purchaseOrders.value = list.items || list;
  } catch (err) {
    console.error('Failed to load POs', err);
  }
});
</script>

<style scoped>
.po-list .page-header { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:12px }
table { width:100%; border-collapse:collapse }
th, td { padding:8px; border:1px solid #eee; text-align:left }
.primary { background:var(--primary,#2563eb); color:#fff; padding:8px 10px; border-radius:6px; text-decoration:none }
.card { background:#fff; padding:12px; border:1px solid var(--border,#eee); border-radius:8px }
</style>
