<template>
  <section
    :class="[
      'w-full bg-white',
      { 'shadow-sm rounded-lg': showOutline },
      sectionStyle,
    ]"
  >
    <slot name="header">
      <header
        v-if="title"
        class="flex items-center justify-between px-5.5 py-3"
      >
        <h4 class="font-medium text-lg text-gray-600">
          {{ title }}
          <span
            v-if="showTotal"
            class="bg-gray-100 text-gray-600 font-normal px-3 rounded-full text-xs"
          >{{ totalItems }} {{ tableName }}</span
          >
        </h4>
        <slot name="action-button">
        </slot>
      </header>
    </slot>
    <article :class="wrapperStyle">
      <div class="overflow-x-auto">
        <table
          :class="[
            setTableStyle,
            'text-sm text-gray-600 divide-y divide-gray-200',
          ]"
          aria-label="Data Table"
        >
          <thead>
          <!-- double header -->
          <tr v-if="doubleHeader">
            <th
              v-for="(header, index) in topHeaders"
              :key="header.key"
              :aria-label="header.label"
              :class="[
                  'bg-gray-100 font-normal text-gray-600 text-center border-b border-t border-gray-200 last:border-none px-6 py-3 ',
                  typeof headerStyles === 'function'
                    ? headerStyles(header)
                    : headerStyles,
                ]"
              :colspan="
                  header.colspan
                    ? header.colspan
                    : index === topHeaders.length - 1
                      ? 2
                      : 1
                "
              :rowspan="header?.rowspan"
              scope="col"
            >
              {{ header.label }}
              <span v-show="currency && header.type === 'currency'"
              >({{ currency }})</span
              >
            </th>
          </tr>
          <!-- regular header -->
          <tr :class="[trStyle, 'bg-gray-100 divide-gray-200']">
            <th v-if="showCheckbox" class="px-3 py-3 text-center" scope="col">
              <input
                id="selectAll"
                type="checkbox"
                @change="handleSelectAll"
              />
            </th>
            <th
              v-for="header in headers"
              :key="header.key"
              :aria-label="header.label"
              :class="[
                  ' font-normal text-gray-600 text-left px-6 py-3',
                  getClasses(header.type || 'text'),
                  typeof headerStyles === 'function'
                    ? headerStyles(header)
                    : headerStyles,
                ]"
              :style="{ width: columnWidths[header.key] || 'auto' }"
              scope="col"
            >
              <div class="flex items-center">
                {{ header.label }}
                <span v-show="currency && header.type === 'currency'"
                >({{ currency }})</span
                >
                <i
                  v-if="header.sortable"
                  :class="[
                      'text-center cursor-pointer ml-1 pi pi-sort',
                      {
                        'rotate-180': header.sortDirection === 'desc',
                      },
                    ]"
                  style="font-size: 20px"
                  @click="emit('sort', header.key, header.sortDirection || 'asc')"
                ></i>
              </div>
            </th>
            <th v-if="showMenu" scope="col"></th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
          <template v-for="(item, itemIndex) in items" :key="itemIndex">
            <tr
              :class="[
                  trStyle,
                  'hover:bg-[#F9FAFB] hover:cursor-pointer divide-gray-200',
                ]"
            >
              <td v-if="showCheckbox" class="px-3 py-3 text-center">
                <input
                  :id="`row_${itemIndex}`"
                  v-model="selectedRows"
                  :value="item"
                  type="checkbox"
                />
              </td>
              <td
                v-for="header in headers"
                :key="header.key"
                :class="[
                    'font-normal  px-3 py-3',
                    getClasses(header.type || 'text'),
                    typeof rowStyles === 'function'
                      ? rowStyles(item, itemIndex, header.key)
                      : rowStyles,
                  ]"
                :style="{ width: columnWidths[header.key] || 'auto' }"
                @click="
                    emit('item-click', { ...item, option: 'View', itemIndex })
                  "
              >
                <slot
                  :index="itemIndex"
                  :item="item"
                  :itemIndex="itemIndex"
                  :name="header.key"
                >
                  <!-- If this column is a 'list' type, display the first item plus +X,
and show the rest on hover in a popover. -->
                  <div
                    v-if="header.type === 'list'"
                    class="relative inline-block"
                    @mouseenter="showList(itemIndex)"
                    @mouseleave="hideList()"
                  >
                    <!-- Display the first item or a placeholder if empty -->
                    <p class="flex">
                      <!-- Show the first list item or "-" if none -->
                      {{ getListValue(item[header.key])?.[0] || "-" }}

                      <!-- If more than 1 item, display +X -->
                      <span
                        v-if="getListLength(item[header.key]) > 1"
                        class="bg-[#F3F3F8] rounded-xl text-[0.6875rem] ml-1 flex items-center justify-center px-2 py-0.5"
                      >
                          +{{ getListLength(item[header.key]) - 1 }}
                        </span>
                    </p>

                    <!-- Popover: show all items except the first one -->
                    <div
                      v-if="show === itemIndex"
                      class="bg-white w-max absolute top-full left-0 mt-1 z-30 flex flex-col justify-between items-start shadow-lg rounded-lg text-sm"
                    >
                      <p
                        v-for="(listItem, i) in getListValue(item[header.key])"
                        :key="i"
                        class="cursor-pointer w-full text-no-wrap px-4 py-1 hover:bg-gray-50 transition-colors ease-in-out duration-300 text-sm"
                      >
                        {{ listItem }}
                      </p>
                    </div>
                  </div>

                  <!-- Otherwise, display a normal cell using formatValue -->
                  <p
                    v-else-if="typeof item[header.key] === 'object' && item[header.key] !== null"
                    class="flex flex-col px-3"
                  >
                    <span>{{ getObjectValue(item[header.key], 'name') || "" }}</span>
                    <span class="text-[#8F95B2]">{{
                        formatDateValue(getObjectValue(item[header.key], 'duration')) || "-"
                      }}</span>
                  </p>
                  <p v-else :class="['px-3 rounded-full inline-block']">
                    {{ formatValue(item[header.key], header.type) }}
                  </p>
                </slot>
              </td>
              <!-- menu -->
              <td v-if="showMenu" :class="['z-10  px-3 py-3', menuStyles]">
                <slot :item="item" :itemIndex="itemIndex" name="menu">
                  <i
                    class="pi pi-ellipsis-v hidden md:block w-4 h-4 cursor-pointer"
                    @click="toggleMenu($event, item)"
                  ></i>
                </slot>
              </td>
            </tr>
          </template>
          <tr v-if="items.length <= 0">
            <td
              :colspan="headers.length + (showMenu ? 1 : 0) + (showCheckbox ? 1 : 0)"
              class="text-center text-[#667085] py-4 h-90"
            >
              <div
                class="h-12 w-12 rounded-full mx-auto bg-gray-100 flex items-center justify-center"
              >
                <p
                  class="h-10 w-10 rounded-full mx-auto bg-primary-100 text-primary-600 flex items-center justify-center"
                >
                  <i class="pi pi-table"></i>
                </p>
              </div>
              <p class="font-semibold">{{ emptyStateHeader }}</p>
              <p class="max-w-lg mx-auto">
                {{ emptyStateDescription }}
              </p>
              <button
                v-if="showEmptyStateAction"
                class="text-primary-600 mt-3 cursor-pointer font-medium text-sm hover:text-primary-500"
                @click="emit('empty-state-action')"
              >
                {{ emptyStateActionText }}
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <!-- Updated Pagination Footer with 5 page limit and ellipsis -->
      <footer
        v-if="showPagination && totalPages > 1"
        class="px-4 py-2 flex border-t border-gray-200 items-center"
      >
        <!-- Showing X to Y of Z entries -->
        <div class="font-normal text-base text-[#667085]">
          Showing {{ from }} to {{ to }} of {{ totalItems }} entries
        </div>

        <!-- Page controls -->
        <div class="space-x-2 flex items-center ml-auto">
          <button
            :disabled="currentPage === 1"
            class="py-2 disabled:opacity-50 disabled:cursor-default cursor-pointer"
            @click="goToPage(1)"
          >
            <i class="pi pi-angle-double-left"></i>
          </button>

          <button
            :disabled="currentPage === 1"
            class="disabled:opacity-50 disabled:cursor-default cursor-pointer"
            @click="goToPage(currentPage - 1)"
          >
            <i class="pi pi-angle-left"></i>
          </button>

          <!-- Page numbers with ellipsis logic -->
          <template v-for="item in paginationItems" :key="item.key">
            <!-- Ellipsis -->
            <span
              v-if="item.type === 'ellipsis'"
              class="px-2 py-2 text-[#667085] text-sm"
            >
              ...
            </span>

            <!-- Page button -->
            <button
              v-else
              :class="[
                'px-4 py-2 rounded-lg border border-none text-sm font-normal cursor-pointer ',
                currentPage === item.page
                  ? 'bg-primary text-white'
                  : 'text-[#667085] hover:text-[#083C5A]',
              ]"
              @click="goToPage(item.page as number)"
            >
              {{ item.page }}
            </button>
          </template>

          <button
            :disabled="currentPage === totalPages"
            class="py-1 disabled:opacity-50 disabled:cursor-default cursor-pointer"
            @click="goToPage(currentPage + 1)"
          >
            <i class="pi pi-angle-right"></i>
          </button>
          <button
            :disabled="currentPage === totalPages"
            class="py-2 disabled:cursor-default disabled:opacity-50"
            @click="goToPage(totalPages)"
          >
            <i class="pi pi-angle-double-right"></i>
          </button>
        </div>
      </footer>
    </article>
    <Menu id="tableMenu" ref="menu" :model="dropdownOptions" :popup="true">
      <template #item="slotProps">
        <p
          class="cursor-pointer hover:text-primary pl-2"
          @click="handleMenuClick(slotProps.item as DropdownOption)"
        >
          {{ slotProps.item.label }}
        </p>
      </template>
    </Menu>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Menu } from "primevue";

// Define proper types
interface Header {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'list' | 'boolean' | 'currency' | 'object';
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc';
  colspan?: number;
  rowspan?: number;
}

interface TableItem {
  [key: string]: any;
}

interface ObjectValue {
  name?: string;
  duration?: string | number;
  [key: string]: unknown;
}

interface DropdownOption {
  key: string;
  label: string;
}

interface MenuClickPayload {
  event: DropdownOption;
  item: TableItem;
}

interface PaginationItem {
  type: 'page' | 'ellipsis';
  page?: number;
  key: string;
}

type HeaderStyleFunction = (header: Header) => string;
type RowStyleFunction = (item: TableItem, index: number, key: string) => string;

const props = withDefaults(defineProps<{
  tableName?: string;
  title?: string;
  headers?: Header[];
  items?: TableItem[];
  showCurrency?: boolean;
  showAddBtn?: boolean;
  addBtnText?: string;
  currency?: string;
  setTableStyle?: string;
  showTotal?: boolean;
  doubleHeader?: boolean;
  topHeaders?: Header[];
  rowStyles?: string | RowStyleFunction;
  columnWidths?: Record<string, string>;
  headerStyles?: string | HeaderStyleFunction;
  showPagination?: boolean;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  showMenu?: boolean;
  dropdownOptions?: DropdownOption[];
  showOutline?: boolean;
  sectionStyle?: string;
  trStyle?: string;
  showCheckbox?: boolean;
  wrapperStyle?: string;
  emptyStateHeader?: string;
  emptyStateDescription?: string;
  showEmptyStateAction?: boolean;
  emptyStateActionText?: string;
  menuStyles?: string;
}>(), {
  tableName: "",
  title: "",
  headers: () => [],
  items: () => [],
  showCurrency: false,
  showAddBtn: false,
  addBtnText: "",
  currency: "USD",
  setTableStyle: "min-w-full",
  showTotal: false,
  doubleHeader: false,
  topHeaders: () => [],
  rowStyles: "",
  columnWidths: () => ({}),
  headerStyles: "",
  showPagination: false,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  showMenu: false,
  dropdownOptions: () => [
    { key: "view", label: "View User" },
    { key: "delete", label: "Delete" },
  ],
  showOutline: true,
  sectionStyle: "",
  trStyle: "",
  showCheckbox: false,
  wrapperStyle: "overflow-hidden",
  emptyStateHeader: "No data available",
  emptyStateDescription: "You'll see all data here once it's available",
  showEmptyStateAction: false,
  emptyStateActionText: "Refresh",
  menuStyles: "",
});

const emit = defineEmits<{
  "menu-click": [payload: MenuClickPayload];
  "item-click": [item: TableItem & { option: string; itemIndex: number }];
  "add-btn-click": [];
  "selection-change": [selectedRows: TableItem[]];
  "page-changed": [page: number];
  "sort": [key: string, direction: string];
  "empty-state-action": [];
}>();

// Reactive data
const show = ref<number | null>(null);
const selectedRows = ref<TableItem[]>([]);
const selectedItem = ref<TableItem | null>(null);
const menu = ref();

// Helper functions for type safety
const getListValue = (value: unknown): string[] => {
  return Array.isArray(value) ? value : [];
};

const getListLength = (value: unknown): number => {
  return Array.isArray(value) ? value.length : 0;
};

const getObjectValue = (obj: unknown, key: string): unknown => {
  if (obj && typeof obj === 'object' && key in obj) {
    return (obj as Record<string, unknown>)[key];
  }
  return undefined;
};

// Simple date formatter to avoid external dependency
const formatDateValue = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  return '';
};

// Computed properties
const paginationItems = computed((): PaginationItem[] => {
  const maxPages = 5;
  const items: PaginationItem[] = [];

  if (totalPages.value <= maxPages) {
    for (let i = 1; i <= totalPages.value; i++) {
      items.push({
        type: "page",
        page: i,
        key: `page-${i}`,
      });
    }
  } else if (props.currentPage <= 3) {
    for (let i = 1; i <= 4; i++) {
      items.push({
        type: "page",
        page: i,
        key: `page-${i}`,
      });
    }
    items.push({
      type: "ellipsis",
      key: "ellipsis-end",
    });
    items.push({
      type: "page",
      page: totalPages.value,
      key: `page-${totalPages.value}`,
    });
  } else if (props.currentPage >= totalPages.value - 2) {
    items.push({
      type: "page",
      page: 1,
      key: "page-1",
    });
    items.push({
      type: "ellipsis",
      key: "ellipsis-start",
    });
    for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
      items.push({
        type: "page",
        page: i,
        key: `page-${i}`,
      });
    }
  } else {
    items.push({
      type: "page",
      page: 1,
      key: "page-1",
    });
    items.push({
      type: "ellipsis",
      key: "ellipsis-start",
    });
    items.push({
      type: "page",
      page: props.currentPage - 1,
      key: `page-${props.currentPage - 1}`,
    });
    items.push({
      type: "page",
      page: props.currentPage,
      key: `page-${props.currentPage}`,
    });
    items.push({
      type: "page",
      page: props.currentPage + 1,
      key: `page-${props.currentPage + 1}`,
    });
    items.push({
      type: "ellipsis",
      key: "ellipsis-end",
    });
    items.push({
      type: "page",
      page: totalPages.value,
      key: `page-${totalPages.value}`,
    });
  }

  return items;
});

const totalPages = computed(() => {
  if (!props.showPagination) return 1;
  return Math.ceil(props.totalItems / props.pageSize);
});

const from = computed(() => {
  if (!props.items.length) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const to = computed(() => {
  return (props.currentPage - 1) * props.pageSize + props.items.length;
});

const getClasses = (type: string) => {
  return type === "currency" ? "text-right" : "text-left";
};

// Watchers
watch(
  selectedRows,
  (newVal) => {
    emit("selection-change", newVal);
  },
  { deep: true }
);

// Methods
const handleMenuClick = (event: DropdownOption) => {
  if (selectedItem.value) {
    emit("menu-click", { event, item: selectedItem.value });
  }
};

const toggleMenu = (event: Event, item: TableItem) => {
  selectedItem.value = item;
  menu.value?.toggle?.(event);
};

const handleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    selectedRows.value = [...props.items];
  } else {
    selectedRows.value = [];
  }
};

const showList = (index: number) => {
  show.value = index;
};

const hideList = () => {
  show.value = null;
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  emit("page-changed", page);
};

const formatValue = (value: unknown, type?: string): string => {
  const defineType = [null, undefined, 0, "0"];
  const checkValue = defineType.includes(value as null | undefined | number | string) ? "" : value;

  switch (type) {
    case "date":
      return checkValue ? formatDateValue(checkValue) : "-";
    case "list":
      return Array.isArray(checkValue) ? checkValue.join(", ") : "-";
    case "boolean":
      return checkValue === true ? "Yes" : "No";
    default:
      return checkValue ? String(checkValue) : "-";
  }
};
</script>

<style scoped>
input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  outline: none;
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
}

input[type="checkbox"]:checked {
  background: #a8d7f3;
  border-color: #a8d7f3;
}

input[type="checkbox"]:checked::before {
  content: "✔";
  color: #0b5887;
  font-size: 12px;
  font-weight: bold;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

input[type="checkbox"]:disabled {
  color: #475467;
  background: #f2f4f7;
  cursor: default;
}

/* Table row hover for light/dark mode */

/* Light mode row hover */
table tr:hover {
  background: var(--app-table-hover, #f9fafb) !important;
  transition: background 0.2s;
}

/* Force dark mode row hover */
html.theme-dark table tr:hover,
.theme-dark table tr:hover {
  background: #23293a !important;
  transition: background 0.2s;
}

:root {
  --app-table-hover: #f9fafb;
}

html.theme-dark :root,
.theme-dark :root {
  --app-table-hover: #2d3344;
}
</style>
