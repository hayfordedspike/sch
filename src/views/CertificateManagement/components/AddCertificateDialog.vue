<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '50rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <h2 class="text-blue-500 font-bold text-3xl">
        {{ editMode ? 'Edit Certificate' : 'Add Certificate' }}
      </h2>
    </template>

    <div class="flex flex-col gap-4 py-4">

      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <label for="certificateId" class="font-semibold">Certificate ID</label>
          <Dropdown
            id="certificateId"
            v-model="formData.certificate_id"
            :options="certificateIdOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select certificate"
            class="w-full app-input"
            :class="{ 'p-invalid': errors.certificate_id }"
          />
          <small v-if="errors.certificate_id" class="text-red-500">{{ errors.certificate_id }}</small>
        </div>

      </div>

      <!-- Second row: Certificate ID (again for number) and Issue Date -->
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <label for="certificateId2" class="font-semibold">Certificate Number</label>
          <InputText
            id="certificateId2"
            v-model="formData.certificate_id"
            placeholder="Enter certificate number"
            :class="{ 'p-invalid': errors.certificate_id }"
          />
          <small v-if="errors.certificate_id" class="text-red-500">{{ errors.certificate_id }}</small>
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <label for="issueDate" class="font-semibold">Issue Date</label>
          <Calendar
            id="issueDate"
            v-model="formData.issue_date"
            placeholder="Select issue date"
            showIcon
          />
        </div>
      </div>

      <!-- Third row: Certificate Type and Expiry Date -->
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <label for="certificateType" class="font-semibold">Status</label>
          <Dropdown
  id="status"
  v-model="formData.status"
  :options="statusOptions"
  optionLabel="label"
  optionValue="value"
  placeholder="Select status"
        class="w-full app-input"
  :class="{ 'p-invalid': errors.status }"
/>
          <small v-if="errors.status" class="text-red-500">{{ errors.status }}</small>
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <label for="expiryDate" class="font-semibold">Expiry Date</label>
          <Calendar
            id="expiryDate"
            v-model="formData.expiry_date"
            placeholder="Select expiry date"
            showIcon
            :class="{ 'p-invalid': errors.expiry_date }"
          />
          <small v-if="errors.expiry_date" class="text-red-500">{{ errors.expiry_date }}</small>
        </div>
      </div>

      <!-- Note field -->
      <div class="flex flex-col gap-2">
        <label for="note" class="font-semibold">Note</label>
        <Textarea
          id="note"
          v-model="formData.note"
          placeholder="Enter any additional notes"
          rows="3"
          class="app-input"
        />
      </div>

      <!-- Certificate Item File Upload (Modern Dropzone) -->
      <div class="flex flex-col gap-2">
        <label for="certificateItem" class="font-semibold">Item Certificate</label>
        <div
          class="w-full border-2 border-dashed border-blue-400 rounded-lg flex flex-col items-center justify-center py-8 cursor-pointer hover:border-blue-600 transition relative"
          @dragover.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            id="certificateItem"
            accept=".pdf,.jpg,.jpeg,.png"
            class="hidden"
            multiple
            @change="handleFileChange"
          />
          <template v-if="formData.certificate_items.length === 0">
            <div class="flex flex-col items-center">
              <i class="pi pi-upload text-4xl text-blue-400 mb-2"></i>
              <span class="text-gray-600">Drag your files or <span class="text-blue-500 font-semibold">browse</span></span>
              <span class="text-xs text-gray-400 mt-1">Max 10MB files are allowed</span>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center w-full">
              <div v-for="(file, idx) in formData.certificate_items" :key="idx" class="flex flex-col items-center mb-4 w-full">
                <template v-if="file.type && file.type.startsWith('image/')">
                  <img :src="filePreviews[idx]" alt="Preview" class="max-h-32 mb-2 rounded shadow" />
                </template>
                <template v-else>
                  <i class="pi pi-file-pdf text-4xl text-red-400 mb-2"></i>
                  <span class="text-gray-700">{{ file.name }}</span>
                </template>
                <GlobalButton label="Remove" severity="danger" size="sm" class="mt-2" @click.stop="removeFile(idx)" />
              </div>
            </div>
          </template>
        </div>
        <small class="text-gray-500 text-xs">Only support PDF, JPG, JPEG, and PNG</small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <GlobalButton label="Cancel" @click="handleClose" type="warning" />
        <GlobalButton
          :label="editMode ? 'Update Certificate' : 'Add Certificate'"
          @click="handleSubmit"
          :loading="loading"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Inactive', value: 'INACTIVE' }
];
import { useCertificates } from '@/composables/useCertificates';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import GlobalButton from '@/components/shared/GlobalButton.vue'

import type { Certificate } from '../types';

const props = defineProps<{ visible: boolean; certificate?: Certificate }>();
const emit = defineEmits(['update:visible', 'certificate-added', 'certificate-updated']);

interface CertificateFormData {
  certificate_id: string;
  issuing_organisation: string;
  issue_date: Date | null;
  expiry_date: Date | null;
  status: string;
  certificate_items: File[];
  note: string;
}

const formData = ref<CertificateFormData>({
  certificate_id: '',
  issuing_organisation: '',
  issue_date: null,
  expiry_date: null,
  status: '',
  certificate_items: [],
  note: ''
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const filePreviews = ref<string[]>([]);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    formData.value.certificate_items = Array.from(input.files);
    filePreviews.value = formData.value.certificate_items.map((file: File) =>
      file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    );
  }
}

function handleDrop(event: DragEvent) {
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    formData.value.certificate_items = Array.from(event.dataTransfer.files);
    filePreviews.value = formData.value.certificate_items.map((file: File) =>
      file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    );
  }
}

function removeFile(idx: number) {
  formData.value.certificate_items.splice(idx, 1);
  filePreviews.value.splice(idx, 1);
}

const certificatesApi = useCertificates();
const {
  certificateIdOptions,
  fetchActiveCertificates,
  initCertificateUpload,
  updateEmployeeCertificate,
  createEmployeeCertificate,
  ensureEmployeeId,
  loading
} = certificatesApi;

onMounted(() => {
  fetchActiveCertificates();
});

const errors = ref<Record<string, string>>({});

const isVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});

const editMode = computed(() => !!props.certificate);

interface InitUploadData {
  upload_url: string;
  file_name: string;
}

// Ensure we resolve employee id as soon as dialog mounts
ensureEmployeeId().catch((err) => {
  console.error('Failed to resolve employee ID:', err);
});

watch(
  () => props.certificate,
  (newCertificate: Certificate | undefined) => {
    if (newCertificate) {
      formData.value = {
        certificate_id: newCertificate.certificate_id || '',
        issuing_organisation: newCertificate.issuing_organisation || '',
  issue_date: newCertificate.issue_date ? new Date(newCertificate.issue_date) : null,
  expiry_date: newCertificate.expiry_date ? new Date(newCertificate.expiry_date) : null,
        status: newCertificate.status || '',
        certificate_items: [],

        note: newCertificate.issuing_organisation || ''
      };
    } else {
      formData.value = {
        certificate_id: '',
        issuing_organisation: '',
  issue_date: null,
  expiry_date: null,
        status: '',
        certificate_items: [],

        note: ''
      };
    }
    errors.value = {};
  },
  { immediate: true }
);

const validateForm = (): boolean => {
  errors.value = {};
  let isValid = true;

  if (
    !formData.value.certificate_id ||
    String(formData.value.certificate_id).trim() === ''
  ) {
    errors.value.certificate_id = 'Certificate ID is required';
    isValid = false;
  }




if (!formData.value.status || String(formData.value.status).trim() === '') {
  errors.value.status = 'Status is required';
  isValid = false;
}

  if (!formData.value.expiry_date) {
    errors.value.expiry_date = 'Expiry date is required';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return;
    }

    const employeeId = await ensureEmployeeId();
    if (!employeeId) {
      throw new Error('No employee record linked to the current user.');
    }
    const certificateId = Number(formData.value.certificate_id);
    const contentType = "application/pdf"; // Default content type


    // 1. Init upload
  const initUploadData = await initCertificateUpload(employeeId, certificateId, contentType) as InitUploadData;
    if (!initUploadData || !initUploadData.upload_url || !initUploadData.file_name) {
      throw new Error('Failed to initialize upload');
    }
  //const { upload_url } = initUploadData;

    // 2. (No S3 upload step: we only collect upload_url and use it as s3_key)
    // 3. Prepare payload for create/update
    const certPayload = {
      employee_id: employeeId,
      certificate_id: certificateId,
      certificate_no: String(formData.value.certificate_id), // ensure string
      issuing_organisation: formData.value.issuing_organisation,
      issued_on: formData.value.issue_date
        ? new Date(formData.value.issue_date).toISOString() // full ISO string with timezone
        : new Date().toISOString(),
      expires_on: formData.value.expiry_date
        ? new Date(formData.value.expiry_date).toISOString() // full ISO string with timezone
        : new Date().toISOString(),
      status: formData.value.status,
      s3_key: initUploadData.file_name,
      content_type: contentType,
      created_at: new Date().toISOString(),
      note: formData.value.note
    };

    if (editMode.value && props.certificate) {
      const updated = await updateEmployeeCertificate(
        employeeId,
        certificateId,
        certPayload,
        props.certificate.id // employee_cert_id if available
      );

      if (updated) {
        emit('certificate-updated');
        handleClose();
      } else {
        console.error('Certificate update failed:', updated);
      }
    } else {
      const certData = await createEmployeeCertificate(certPayload);

      if (certData) {
        emit('certificate-added');
        handleClose();
      } else {
        console.error('Certificate creation failed:', certData);
      }
    }
  } catch (error) {
    console.error('Error in handleSubmit:', error);
  }
};

function handleClose() {
      formData.value = {
        certificate_id: '',
        issuing_organisation: '',
        issue_date: null,
        expiry_date: null,
        status: '',
        certificate_items: [],

        note: ''
      };
  errors.value = {};
  filePreviews.value = [];
  emit('update:visible', false);
}
</script>

<style scoped>
.p-invalid {
  border-color: #ef4444;
}

:deep(.p-dialog-header-close) {
  width: 1.75rem !important;
  height: 1.75rem !important;
  border-radius: 50% !important;
  border: 2px solid #9ca3af !important;
  background: transparent !important;
  color: #6b7280 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
}

:deep(.p-dialog-header-close .p-icon) {
  width: 0.75rem !important;
  height: 0.75rem !important;
}

:deep(.p-dialog-header-close:hover) {
  background: #f3f4f6 !important;
  border-color: #6b7280 !important;
  color: #4b5563 !important;
}

:deep(.p-dialog-header-close:focus) {
  box-shadow: none !important;
  border: 2px solid #9ca3af !important;
}

:deep(.p-dialog-header-close:active) {
  border: 2px solid #9ca3af !important;
}
</style>
