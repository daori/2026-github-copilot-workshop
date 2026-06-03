<template>
  <div class="card-panel">
    <p class="form-section-title">PO Header</p>
    <div class="form-row">
      <div class="form-group">
        <label>Vendor</label>
        <input v-model="model.vendor" placeholder="Type..." />
      </div>
      <div class="form-group">
        <label>Needed By date</label>
        <input v-model="model.neededByDate" type="date" />
      </div>
      <div class="form-group">
        <label>Currency</label>
        <input v-model="model.currency" placeholder="IDR..." />
      </div>
      <div class="form-group">
        <label>Payment Terms</label>
        <input v-model="model.paymentTerms" placeholder="Type..." />
      </div>
    </div>
    <div class="form-group full">
      <label>Notes</label>
      <textarea v-model="model.notes" placeholder="Type..." rows="3" />
    </div>
  </div>
</template>

<script setup>
// Reusable PO header form. The parent owns the header object via v-model;
// fields are mutated in place on the shared reactive object.
const model = defineModel({ required: true });
</script>
