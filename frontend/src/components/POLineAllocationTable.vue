<template>
  <div class="card-panel">
    <div class="card-panel-header">
      <p class="form-section-title" style="margin: 0">Approved PR Lines</p>
      <button type="button" class="btn btn-outline" @click="$emit('refresh')">
        Refresh Open Lines
      </button>
    </div>

    <p v-if="!rows.length" class="muted">
      No approved PR lines available for allocation.
    </p>

    <div v-else class="table-scroll">
      <table>
        <thead>
          <tr>
            <th style="width: 50px">Select</th>
            <th>PR No</th>
            <th>PR Line</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>UOM</th>
            <th>Requested QTY</th>
            <th>Allocated QTY</th>
            <th>Remaining QTY</th>
            <th style="width: 90px">Order QTY</th>
            <th>Delivery Address</th>
            <th>Delivery Date</th>
            <th style="width: 110px">Unit Price</th>
            <th>Line Amount</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, index) in rows" :key="row.prLineId">
            <tr :class="{ 'row-selected': row.selected }">
              <td><input type="checkbox" v-model="row.selected" /></td>
              <td>{{ row.prNumber }}</td>
              <td>{{ row.prLineNo }}</td>
              <td>{{ row.itemCode }}</td>
              <td>{{ row.itemName }}</td>
              <td>{{ row.uom }}</td>
              <td>{{ row.qtyRequested }}</td>
              <td>{{ row.qtyAllocated }}</td>
              <td>{{ row.remainingQty }}</td>
              <td>
                <input
                  v-model.number="row.orderQty"
                  type="number"
                  min="0"
                  step="0.01"
                  :max="row.remainingQty"
                  :disabled="!row.selected"
                  :class="{ 'input-error': lineError(row) }"
                  placeholder="0..."
                />
              </td>
              <td>
                <input v-model="row.deliveryAddress" :disabled="!row.selected" placeholder="Type..." />
              </td>
              <td>
                <input v-model="row.deliveryDate" type="date" :disabled="!row.selected" />
              </td>
              <td>
                <input
                  v-model.number="row.unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  :disabled="!row.selected"
                  placeholder="0"
                />
              </td>
              <td>{{ formatNumber(lineAmount(row)) }}</td>
            </tr>
            <tr v-if="lineError(row)" class="error-row">
              <td :colspan="14" class="error">{{ lineError(row) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: {
    type: Array,
    required: true,
  },
});

defineEmits(['refresh']);

function lineAmount(row) {
  return (Number(row.orderQty) || 0) * (Number(row.unitPrice) || 0);
}

// Mirror the backend over-allocation rule so the user gets immediate feedback.
function lineError(row) {
  if (!row.selected) return '';
  const qty = Number(row.orderQty) || 0;
  if (qty <= 0) {
    return `${row.prNumber} line ${row.prLineNo}: order qty must be greater than 0`;
  }
  if (qty > row.remainingQty) {
    return `${row.prNumber} line ${row.prLineNo}: order qty ${qty} exceeds remaining ${row.remainingQty}`;
  }
  return '';
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}
</script>

<style scoped>
.table-scroll {
  overflow-x: auto;
}
.card-panel table input[type='text'],
.card-panel table input[type='number'],
.card-panel table input[type='date'],
.card-panel table input:not([type]) {
  width: 100%;
  min-width: 80px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 13px;
}
.card-panel table input:focus {
  border-color: var(--primary);
  outline: none;
}
.card-panel table input:disabled {
  background: #fafafa;
  color: var(--text-muted);
}
.input-error {
  border-color: #c62828 !important;
}
.row-selected td {
  background: rgba(255, 64, 129, 0.04);
}
.error-row td {
  padding-top: 0;
  border-bottom: 1px solid var(--border);
}
</style>
