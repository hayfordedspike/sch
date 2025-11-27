<template>
  <div class="min-h-screen bg-white py-8">
    <!-- Profile Header - Full Width -->
    <div class="w-full mb-8">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader
          :user="user"
          :editing="editingProfile"
          @edit="handleEditProfile"
          @save="handleSaveProfile"
          @cancel="handleCancelEdit"
          @change-password="showChangePasswordDialog = true"
        />
          <!-- Change Password Modal -->
          <Dialog v-model:visible="showChangePasswordDialog" modal header="Change Password" :style="{ width: '400px' }">
            <form @submit.prevent="handleChangePassword">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <InputText v-model="changePasswordForm.current_password" type="password" class="w-full" required />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <InputText v-model="changePasswordForm.new_password" type="password" class="w-full" required />
              </div>
              <div class="flex justify-end gap-2 mt-6">
                <Button label="Cancel" @click="showChangePasswordDialog = false" severity="secondary" outlined />
                <Button label="Change Password" type="submit" class="bg-orange-500 text-white" />
              </div>
            </form>
          </Dialog>
      </div>
    </div>

    <!-- Personal Data Section - Full Width -->
    <div class="w-full">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <PersonalDataSection
          :user="user"
          :editing="editingProfile"
          :profile-data="profileData"
          @update="handleProfileUpdate"
        />
      </div>
    </div>

    <!-- Certifications Section - Full Width -->
    <div class="w-full">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <CertificationsSection
          :user-certifications="userCertifications"
          :loading="certificatesLoading"
          @add-certificate="handleAddCertificate"
          @edit-certificate="handleEditCertificate"
          @delete-certificate="handleDeleteCertificate"
        />
      </div>
    </div>

    <!-- Go to Dashboard Button - Full Width -->
    <div class="w-full mt-12">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Button
          @click="goToDashboard"
          class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0"
          label="Back To Dashboard"
          icon="pi pi-home"
          size="large"
        />
      </div>
    </div>

    <!-- Add Certificate Dialog -->
    <AddCertificateDialog
      v-model:visible="showAddCertificateDialog"
      :certificate="editingCertificate"
      @certificate-added="handleCertificateAdded"
      @certificate-updated="handleCertificateUpdated"
      @update:visible="handleDialogVisibilityChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfile } from '@/composables/useProfile'
import { useCertificates } from '@/composables/useCertificates'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import ProfileHeader from './components/ProfileHeader.vue'
import PersonalDataSection from './components/PersonalDataSection.vue'
import CertificationsSection from './components/CertificationsSection.vue'
import AddCertificateDialog from '@/views/CertificateManagement/components/AddCertificateDialog.vue'
import type { ProfileData, UserCertification } from '@/views/Profile/types'
import type { Certificate } from '@/views/CertificateManagement/types'

defineOptions({ name: 'ProfileView' })

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { profile, fetchProfile, updateProfile } = useProfile()
const {
  fetchActiveCertificates,
  getCertificate,
  deleteCertificate: deleteCertificateAPI,
  loading: certificatesLoading
} = useCertificates()

// State
const editingProfile = ref(false)
const showAddCertificateDialog = ref(false)
const editingCertificate = ref<Certificate | undefined>(undefined)
const showChangePasswordDialog = ref(false)
const changePasswordForm = ref({
  current_password: '',
  new_password: ''
})
const { user } = useAuth()
// Change Password handler
const handleChangePassword = async () => {
  try {
    const res = await fetch('/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(changePasswordForm.value)
    })
    if (!res.ok) throw new Error('Failed to change password')
    toast.add({ severity: 'success', summary: 'Password Changed', detail: 'Your password has been updated.', life: 3000 })
    showChangePasswordDialog.value = false
    changePasswordForm.value.current_password = ''
    changePasswordForm.value.new_password = ''
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.message || 'Could not change password.', life: 4000 })
  }
}

// Mock user certifications - replace with actual API call
const userCertifications = ref<UserCertification[]>([])

// Helper function to map Certificate to UserCertification
const mapCertificateToUserCertification = (cert: Certificate): UserCertification => {
  // Calculate expiry date based on created_at and validity_months
  const createdDate = new Date(cert.created_at)
  const expiryDate = new Date(createdDate)
  expiryDate.setMonth(createdDate.getMonth() + cert.validity_months)

  // Determine status based on expiry date
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  let status: 'active' | 'expiring' | 'expired' = 'active'
  if (daysUntilExpiry <= 0) {
    status = 'expired'
  } else if (daysUntilExpiry <= 30) {
    status = 'expiring'
  }

  return {
    id: cert.id,
    name: cert.name,
    issueDate: cert.created_at,
    expiryDate: expiryDate.toISOString(),
    status,
    certificateNumber: cert.code,
    validity_months: cert.validity_months,
    created_at: cert.created_at
  }
}

// Fetch certificates from API
const loadCertificates = async () => {
  try {
    const apiCertificates = await fetchActiveCertificates()
    if (apiCertificates) {
      userCertifications.value = apiCertificates.map(mapCertificateToUserCertification)
    }
  } catch (error) {
    console.error('Failed to load certificates:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load certificates',
      life: 3000
    })
  }
}

// Computed
const user = computed(() => profile.value || authStore.getUser())

// Methods
const handleEditProfile = () => {
  editingProfile.value = true
  // Pre-populate form with current user data
  if (user.value) {
    profileData.value = {
      fullName: `${user.value.first_name} ${user.value.last_name}`.trim(),
      address: '', // This would come from user profile API
      dateOfBirth: '', // This would come from user profile API
      phone: '', // This would come from user profile API
      email: user.value.email
    }
  }
}

const handleSaveProfile = async () => {
  try {
    // Extract first and last name from full name
    const nameParts = profileData.value.fullName.trim().split(' ')
    const first_name = nameParts[0] || ''
    const last_name = nameParts.slice(1).join(' ') || ''

    const updateData = {
      first_name,
      last_name,
      email: profileData.value.email
    }

    const success = await updateProfile(updateData)

    if (success) {
      editingProfile.value = false
    }
  } catch (error) {
    console.error('Failed to save profile:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: 'Failed to update profile. Please try again.',
      life: 5000
    })
  }
}

const handleCancelEdit = () => {
  editingProfile.value = false
  // Reset form data
  profileData.value = {
    fullName: '',
    address: '',
    dateOfBirth: '',
    phone: '',
    email: ''
  }
}

const handleProfileUpdate = (field: string, value: string) => {
  profileData.value[field as keyof ProfileData] = value
}

const handleAddCertificate = () => {
  editingCertificate.value = undefined  // Ensure we're in add mode
  showAddCertificateDialog.value = true
}

const handleCertificateAdded = async () => {
  // Certificate was successfully added, refresh the certificates list
  toast.add({
    severity: 'success',
    summary: 'Certificate Added',
    detail: 'Certificate has been successfully added.',
    life: 3000
  })

  // Refresh the certificates list
  await loadCertificates()

  // Ensure modal is closed
  showAddCertificateDialog.value = false
  editingCertificate.value = undefined
}

const handleCertificateUpdated = async () => {
  // Certificate was successfully updated, refresh the certificates list
  toast.add({
    severity: 'success',
    summary: 'Certificate Updated',
    detail: 'Certificate has been successfully updated.',
    life: 3000
  })

  // Refresh the certificates list
  await loadCertificates()

  // Ensure modal is closed and editing state is cleared
  showAddCertificateDialog.value = false
  editingCertificate.value = undefined
}

const handleDialogVisibilityChange = (visible: boolean) => {
  showAddCertificateDialog.value = visible
  if (!visible) {
    // Clear editing certificate when dialog is closed
    editingCertificate.value = undefined
  }
}

const handleEditCertificate = async (certification: UserCertification) => {
  try {
    // Fetch the full certificate data from API
    const fullCertificate = await getCertificate(certification.id)
    if (fullCertificate) {
      editingCertificate.value = fullCertificate
      showAddCertificateDialog.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load certificate details',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Failed to fetch certificate:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load certificate details',
      life: 3000
    })
  }
}

const handleDeleteCertificate = async (certification: UserCertification) => {
  try {
    const result = await deleteCertificateAPI(certification.id)
    if (result?.success) {
      // Refresh certificates list from API to ensure fresh data
      await loadCertificates()
      
      toast.add({
        severity: 'success',
        summary: 'Certificate Deleted',
        detail: `Certificate "${certification.name}" has been deleted.`,
        life: 3000
      })
    }
  } catch (error) {
    console.error('Failed to delete certificate:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: 'Failed to delete certificate. Please try again.',
      life: 3000
    })
  }
}

const goToDashboard = () => {
  router.push('/')
}

// Lifecycle
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await fetchProfile()
    await loadCertificates()
  }
})
</script>

<style scoped>
/* Custom styles can be added here if needed */
</style>
