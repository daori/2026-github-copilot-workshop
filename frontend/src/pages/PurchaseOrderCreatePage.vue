<template>
  <section>
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back">&#8592;</RouterLink>
        <div>
          <h2>Create Purchase Order</h2>
          <p class="muted">Pick approved PR lines and allocate order quantities</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- PO Header -->
    <POHeaderForm v-model="header" />

    <!-- Approved PR Lines allocation table -->
    <POLineAllocationTable :rows="rows" @refresh="loadLines" />

    <!-- Summary -->
    <div class="card-panel summary">
      <div>
        <p class="muted" style="margin: 0">Selected Lines</p>
        <p class="summary-count">{{ selectedRows.length }}</p>
      </div>
      <div style="text-align: right">
        <p class="muted" style="margin: 0">Estimated Total</p>
        <p class="summary-total">{{ formatNumber(estimatedTotal) }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="btn-group">
      <button
        type="button"
        class="btn btn-draft"
        :disabled="saving || !canSave"
        @click="save(false)"
      >
        Save As Draft
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="saving || !canSave"
        @click="save(true)"
      >
        Submit PO
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { api } from '../api';
import POHeaderForm from '../components/POHeaderForm.vue';
import POLineAllocationTable from '../components/POLineAllocationTable.vue';

const router = useRouter();
const errorMessage = ref('');
const saving = ref(false);
const rows = ref([]);

const header = reactive({
  vendor: '',
  neededByDate: '',
  currency: 'IDR',
  paymentTerms: '',
  notes: '',
});

function toRow(line) {
  return {
    ...line,
    selected: false,
    orderQty: line.remainingQty,
    deliveryAddress: '',
    deliveryDate: line.requiredDate || '',
    unitPrice: line.estUnitPrice,
  };
}

async function loadLines() {
  errorMessage.value = '';
  try {
    const { items } = await api.getAllocatablePrLines();
    rows.value = items.map(toRow);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

const selectedRows = computed(() => rows.value.filter((row) => row.selected));

const estimatedTotal = computed(() =>
  selectedRows.value.reduce(
    (sum, row) => sum + (Number(row.orderQty) || 0) * (Number(row.unitPrice) || 0),
    0,
  ),
);

// Block save when no selection, missing vendor, or any over-allocation / invalid qty.
const hasInvalidLine = computed(() =>
  selectedRows.value.some((row) => {
    const qty = Number(row.orderQty) || 0;
    return qty <= 0 || qty > row.remainingQty;
  }),
);

const canSave = computed(
  () => header.vendor.trim() && selectedRows.value.length > 0 && !hasInvalidLine.value,
);

function buildPayload() {
  return {
    vendorName: header.vendor.trim(),
    neededByDate: header.neededByDate || null,
    currency: header.currency || null,
    paymentTerms: header.paymentTerms || null,
    notes: header.notes || null,
    lines: selectedRows.value.map((row) => ({
      prLineId: row.prLineId,
      itemCode: row.itemCode,
      itemName: row.itemName,
      qtyOrdered: Number(row.orderQty),
      unitPrice: Number(row.unitPrice) || 0,
      uom: row.uom,
      siteCode: row.siteCode,
      requiredDate: row.deliveryDate || null,
      deliveryAddress: row.deliveryAddress || null,
    })),
  };
}

async function save(submit) {
  errorMessage.value = '';
  saving.value = true;
  try {
    const created = await api.createPurchaseOrder(buildPayload());
    if (submit) {
      await api.submitPurchaseOrder(created.id);
    }
    await router.push('/purchase-orders');
  } catch (error) {
    // Surfaces the backend 422 over-allocation message (e.g.
    // "lines[0]: allocation qty 5 exceeds remaining 3").
    errorMessage.value = error.message;
  } finally {
    saving.value = false;
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

onMounted(loadLines);
</script>

<style scoped>
.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.summary-count {
  font-size: 32px;
  font-weight: 700;
  margin: 4px 0 0;
}
.summary-total {
  font-size: 32px;
  font-weight: 700;
  margin: 4px 0 0;
}
.btn-draft {
  background: #fdb702;
  color: var(--white);
}
</style>
