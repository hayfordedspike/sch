import type {RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Dashboard",
    component: () => import("@/views/Dashboard/index.vue"),
    meta: { 
      layout: "dashboard",
      requiresAuth: true,
      title: "Dashboard"
    },
  },
  {
    path: "/signin",
    name: "SignIn",
    component: () => import("@/views/SignIn/index.vue"),
    meta: { 
      layout: "blank",
      requiresAuth: false,
      guestOnly: true,
      title: "Sign In"
    },
  },
  {
    path: "/register",
    name: "Registration",
    component: () => import("@/views/Registration/index.vue"),
    meta: { 
      layout: "blank",
      requiresAuth: false,
      guestOnly: true,
      title: "Register"
    },
  },
  {
    path: "/auth/verify",
    name: "AuthVerification",
    component: () => import("@/views/Auth/index.vue"),
    meta: { 
      layout: "blank",
      requiresAuth: false,
      title: "Verify Account"
    },
  },
  {
    path: "/clients",
    name: "Clients",
    component: () => import("@/views/Clients/index.vue"),
    meta: { 
      layout: "dashboard",
      requiresAuth: true,
      title: "Clients"
    },
  },
  {
    path: "/roster",
    name: "Roster",
    component: () => import("@/views/Roster/index.vue"),
    meta: { 
      layout: "dashboard",
      requiresAuth: true,
      title: "Roster"
    },
  },
  {
    path: "/team",
    name: "Team",
    component: () => import("@/views/Team/index.vue"),
    meta: { 
      layout: "dashboard",
      requiresAuth: true,
      title: "Team"
    },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/Settings/index.vue"),
    meta: { 
      layout: "dashboard",
      requiresAuth: true,
      title: "Settings"
    },
  },
  {
    path: "/certificate-management",
    name: "Certificate Management",
    component: () => import("@/views/CertificateManagement/index.vue"),
    meta: { 
      layout: "dashboard",
      requiresAuth: true,
      title: "Certificate Management"
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound/index.vue"),
    meta: { 
      layout: "blank",
      requiresAuth: false,
      title: "Page Not Found"
    },
  }
]

export default routes;