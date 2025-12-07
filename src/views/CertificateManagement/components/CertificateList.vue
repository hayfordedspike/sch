<template>
  <div class="certificate-list p-4">
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-semibold">Certificate List</h3>
      <Button
        label="Add Certificate"
        icon="pi pi-plus"
        @click="$emit('add-certificate')"
        class="p-button-primary"
      />
    </div>



      <div class="overflow-x-auto w-full">
        <table class="min-w-full divide-y divide-gray-200 table-auto md:table-fixed">
      <thead class="bg-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ID</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Employee ID</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Certificate ID</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Certificate No</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Content Type</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Issued On</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Expires On</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Note</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Replace By</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Created At</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Updated At</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Item Certificate</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cert, idx) in certificates" :key="cert.id" :class="idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.id }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.employee_id }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.certificate_id }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.certificate_no }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.content_type }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.issued_on ? (new Date(cert.issued_on)).toLocaleDateString() : '-' }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.expires_on ? (new Date(cert.expires_on)).toLocaleDateString() : '-' }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.status }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.note }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.replace_by }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.created_at ? (new Date(cert.created_at)).toLocaleDateString() : '-' }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.updated_at ? (new Date(cert.updated_at)).toLocaleDateString() : '-' }}</td>
          <td class="px-4 py-2 whitespace-nowrap">
            <span v-if="cert.s3_key && cert.s3_key !== 'string'">
              <template v-if="downloadUrls[cert.id]">
                <a
                  :href="downloadUrls[cert.id]"
                  class="text-blue-600 underline"
                  target="_blank"
                >Download</a>
              </template>
              <template v-else>
                <button
                  class="text-blue-600 underline bg-transparent border-none cursor-pointer p-0"
                  @click="getDownloadUrl(cert)"
                >Get Download Link</button>
              </template>
            </span>
            <span v-else class="text-gray-400">No file</span>
          </td>
          <td class="px-4 py-2 whitespace-nowrap">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" rounded outlined severity="info" aria-label="Edit" @click="handleEditCertificate(cert)" />
              <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" @click="handleDeleteCertificate(cert)" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
      </div>

    <!-- Custom Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div class="flex items-center mb-4">
          <i class="pi pi-exclamation-triangle text-orange-500 text-2xl mr-2" />
          <span class="font-semibold text-lg">Delete Confirmation</span>
        </div>
  <p class="mb-6">{{ certificateToDelete ? `Are you sure you want to delete certificate '${certificateToDelete.code}'?` : 'Are you sure you want to delete this certificate?' }}</p>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="cancelDeleteCertificate">Cancel</button>
          <button class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" @click="confirmDeleteCertificate">Yes, Delete</button>
        </div>
      </div>
    </div>

    <!-- Preview Dialog -->
    <Dialog v-model:visible="previewModalVisible" modal header="Preview Certificate Item" :style="{ width: '400px' }">
      <!-- Preview modal removed as requested -->
    </Dialog>

    <AddCertificateDialog
  v-if="showEditModal"
  :visible="showEditModal"
      :certificate="undefined"
  @update:visible="closeEditModal"
  @certificate-updated="closeEditModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import AddCertificateDialog from './AddCertificateDialog.vue'
import { useCertificates } from '@/composables/useCertificates'

// --- Types ---
interface EmployeeCertificate {
  id: number;
  employee_id: number;
  certificate_id: number;
  certificate_no: string;
  content_type: string;
  issued_on: string | null;
  expires_on: string | null;
  status: string;
  note?: string;
  replace_by?: string;
  created_at: string | null;
  updated_at: string | null;
  s3_key?: string;
  [key: string]: unknown;
}

interface DownloadUrlResponse {
  download_url: string;
}

// --- State ---
const certificates = ref<EmployeeCertificate[]>([])
const downloadUrls = ref<{ [id: number]: string }>({})
const showDeleteConfirm = ref(false)
const certificateToDelete = ref<EmployeeCertificate | null>(null)
const previewModalVisible = ref(false)
const showEditModal = ref(false)
const editingCertificate = ref<EmployeeCertificate | null>(null)

// --- Hooks ---
const { fetchEmployeeCertificates, getEmployeeId, fetchEmployeeCertificateDownloadUrl } = useCertificates()

// --- Type guards ---
function isEmployeeCertificateArray(val: unknown): val is EmployeeCertificate[] {
  return Array.isArray(val) && val.every(item => typeof item === 'object' && item !== null && 'id' in item && 'employee_id' in item)
}
function isDownloadUrlResponse(val: unknown): val is DownloadUrlResponse {
  return !!val && typeof val === 'object' && 'download_url' in val
}

// --- Fetch certificates on mount ---
onMounted(async () => {
  const employeeId = await getEmployeeId()
  if (employeeId) {
    const res = await fetchEmployeeCertificates(employeeId)
    if (isEmployeeCertificateArray(res)) {
      certificates.value = res
    } else if (isEmployeeCertificateListResponse(res) && isEmployeeCertificateArray(res.detail)) {
      certificates.value = res.detail
    } else {
      certificates.value = []
    }
interface EmployeeCertificateListResponse {
  detail: EmployeeCertificate[]
}
function isEmployeeCertificateListResponse(val: unknown): val is EmployeeCertificateListResponse {
  return !!val && typeof val === 'object' && Array.isArray((val as EmployeeCertificateListResponse).detail)
}
  }
})

// --- Download logic ---
const getDownloadUrl = async (cert: EmployeeCertificate) => {
  if (!cert.id) return
  const res = await fetchEmployeeCertificateDownloadUrl(cert.id)
  if (isDownloadUrlResponse(res)) {
    downloadUrls.value[cert.id] = res.download_url
  }
}

// --- Edit/Delete logic ---
const handleEditCertificate = (certificate: EmployeeCertificate) => {
  editingCertificate.value = { ...certificate }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCertificate.value = null
}

const handleDeleteCertificate = (certificate: EmployeeCertificate) => {
  certificateToDelete.value = certificate
  showDeleteConfirm.value = true
}

const confirmDeleteCertificate = () => {
  if (certificateToDelete.value) {
    certificates.value = certificates.value.filter(c => c.id !== certificateToDelete.value!.id)
  }
  showDeleteConfirm.value = false
  certificateToDelete.value = null
}

const cancelDeleteCertificate = () => {
  showDeleteConfirm.value = false
  certificateToDelete.value = null
}

// --- Emits ---
defineEmits(['add-certificate', 'view-certificate', 'edit-certificate'])
</script>

