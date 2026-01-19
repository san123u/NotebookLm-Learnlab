/**
 * Centralized route definitions and utilities.
 *
 * Use these functions to generate route paths consistently across the app.
 */

// Base paths
const DASHBOARD_BASE = '/dashboard';
const AUTH_BASE = '/auth';
const ADMIN_BASE = '/admin';

// Route generators for dashboard routes
export const routes = {
  // Landing & Auth
  landing: () => '/',
  auth: {
    login: () => `${AUTH_BASE}/login`,
    signup: () => `${AUTH_BASE}/signup`,
    verify: () => `${AUTH_BASE}/verify`,
    forgotPassword: () => `${AUTH_BASE}/forgot-password`,
    resetPassword: () => `${AUTH_BASE}/reset-password`,
  },

  // Dashboard
  dashboard: () => DASHBOARD_BASE,

  // DEPRECATED: IHC Hierarchy Explorer - TO BE DELETED by 2025-01-05
  // hierarchy: () => `${DASHBOARD_BASE}/hierarchy`,

  // Groups
  groups: () => `${DASHBOARD_BASE}/groups`,
  groupDetail: (code: string) => `${DASHBOARD_BASE}/groups/${code}`,

  // DEPRECATED: Entities pages - TO BE DELETED by 2025-01-05
  // entities: () => `${DASHBOARD_BASE}/entities`,
  // entityProfile: (code: string) => `${DASHBOARD_BASE}/entity/${code}`,

  // Companies
  companies: () => `${DASHBOARD_BASE}/companies`,
  companyTree: () => `${DASHBOARD_BASE}/companies/tree`,
  companyDetail: (uuid: string) => `${DASHBOARD_BASE}/companies/${uuid}`,

  // Financials
  financials: () => `${DASHBOARD_BASE}/financials`,
  financialData: (entityCode: string) => `${DASHBOARD_BASE}/financial-data/${entityCode}`,

  // Comparison & Forecasts
  comparison: () => `${DASHBOARD_BASE}/comparison`,
  forecasts: () => `${DASHBOARD_BASE}/forecasts`,

  // Chat - all routes under /dashboard/chat/*
  chat: () => `${DASHBOARD_BASE}/chat`,
  chatThread: (threadId: string) => `${DASHBOARD_BASE}/chat/c/${threadId}`,
  chatSpace: (spaceId: string) => `${DASHBOARD_BASE}/chat/g/${spaceId}`,
  chatSpaceThread: (spaceId: string, threadId: string) => `${DASHBOARD_BASE}/chat/g/${spaceId}/c/${threadId}`,

  // Employee Profiles
  employeeProfiles: () => `${DASHBOARD_BASE}/employee-profile`,
  createEmployeeProfile: () => `${DASHBOARD_BASE}/employee-profile/create`,
  editEmployeeProfile: (agentId: string) => `${DASHBOARD_BASE}/employee-profile/${agentId}/edit`,

  // My Profile
  myProfile: () => `${DASHBOARD_BASE}/my-profile`,
  addMemory: () => `${DASHBOARD_BASE}/my-profile/add-memory`,
  editMemory: (memoryId: string) => `${DASHBOARD_BASE}/my-profile/edit-memory/${memoryId}`,

  // Account
  account: () => `${DASHBOARD_BASE}/account`,

  // Admin
  admin: {
    dashboard: () => ADMIN_BASE,
    auditedStatements: () => `${ADMIN_BASE}/audited-statements`,
    referenceData: () => `${ADMIN_BASE}/reference-data`,
    users: () => `${ADMIN_BASE}/users`,
    createUser: () => `${ADMIN_BASE}/users/create`,
    editUser: (userId: string) => `${ADMIN_BASE}/users/${userId}`,
    companyAccess: () => `${ADMIN_BASE}/company-access`,
    domains: () => `${ADMIN_BASE}/domains`,
    storage: () => `${ADMIN_BASE}/storage`,
    epmLinks: () => `${ADMIN_BASE}/epm-links`,
    consolidatedUpload: () => `${ADMIN_BASE}/consolidated-upload`,
    uploadData: () => `${ADMIN_BASE}/upload-data`,
    uploadBalanceSheet: () => `${ADMIN_BASE}/upload-data/balance-sheet`,
    uploadIncomeStatement: () => `${ADMIN_BASE}/upload-data/income-statement`,
    employeeProfiles: () => `${ADMIN_BASE}/employee-profiles`,
    createEmployeeProfile: () => `${ADMIN_BASE}/employee-profiles/create`,
    editEmployeeProfile: (agentId: string) => `${ADMIN_BASE}/employee-profiles/${agentId}/edit`,
    jobs: () => `${ADMIN_BASE}/jobs`,
  },
} as const;

export default routes;
