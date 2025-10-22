import { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ui/toast/ToastContainer';
import { AuthAbilityProvider } from '@/lib/casl/AuthAbilityProvider';
import { swrConfig } from '@/lib/swr';

// Loading component
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
  </div>
);

// Lazy load layout
const AppLayout = lazy(() => import('@/layout/AppLayout'));

// Lazy load auth pages
const SignIn = lazy(() => import('@/pages/AuthPages/SignIn'));
const SignUp = lazy(() => import('@/pages/AuthPages/SignUp'));
const ForgotPassword = lazy(() => import('@/pages/AuthPages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/AuthPages/ResetPassword'));

// Lazy load dashboard
const Home = lazy(() => import('@/pages/Dashboard/Home'));

// Lazy load company pages
const CompaniesList = lazy(() => import('@/pages/companies/CompaniesList').then(m => ({ default: m.CompaniesList })));
const CreateCompany = lazy(() => import('@/pages/companies/CompanyForm').then(m => ({ default: m.CreateCompany })));
const ContactPersons = lazy(() => import('@/pages/companies/ContactPersons').then(m => ({ default: m.ContactPersons })));
const BankAccounts = lazy(() => import('@/pages/companies/BankAccounts').then(m => ({ default: m.BankAccounts })));
const Addresses = lazy(() => import('@/pages/companies/Addresses').then(m => ({ default: m.Addresses })));

// Lazy load customer pages
const CustomersList = lazy(() => import('@/pages/customers/CustomersList').then(m => ({ default: m.CustomersList })));
const CustomerForm = lazy(() => import('@/pages/customers/CustomerForm').then(m => ({ default: m.CustomerForm })));

// Lazy load customer group pages
const CustomerGroupsList = lazy(() => import('@/pages/customer-groups/CustomerGroupsList').then(m => ({ default: m.CustomerGroupsList })));
const CreateCustomerGroup = lazy(() => import('@/pages/customer-groups/CustomerGroupForm').then(m => ({ default: m.CreateCustomerGroup })));
const GroupCustomers = lazy(() => import('@/pages/customer-groups/GroupCustomers').then(m => ({ default: m.GroupCustomers })));
const AssignCustomer = lazy(() => import('@/pages/customer-groups/AssignCustomer').then(m => ({ default: m.AssignCustomer })));

// Lazy load vendor pages
const VendorsList = lazy(() => import('@/pages/vendors/VendorsList').then(m => ({ default: m.VendorsList })));
const VendorForm = lazy(() => import('@/pages/vendors/VendorForm').then(m => ({ default: m.VendorForm })));
const VendorDetail = lazy(() => import('@/pages/vendors/VendorDetail').then(m => ({ default: m.VendorDetail })));
const SendInvitation = lazy(() => import('@/pages/vendors/SendInvitation').then(m => ({ default: m.SendInvitation })));
const AcceptInvitation = lazy(() => import('@/pages/vendors/AcceptInvitation').then(m => ({ default: m.AcceptInvitation })));
const CompleteProfile = lazy(() => import('@/pages/vendors/CompleteProfile').then(m => ({ default: m.CompleteProfile })));

// Lazy load vendor group pages
const VendorGroupsList = lazy(() => import('@/pages/vendor-groups/VendorGroupsList').then(m => ({ default: m.VendorGroupsList })));
const VendorGroupForm = lazy(() => import('@/pages/vendor-groups/VendorGroupForm').then(m => ({ default: m.VendorGroupForm })));
const AssignVendor = lazy(() => import('@/pages/vendor-groups/AssignVendor').then(m => ({ default: m.AssignVendor })));

// Lazy load plan pages
const Plans = lazy(() => import('@/pages/plans/Plans'));
const CreatePlan = lazy(() => import('@/pages/plans/CreatePlan'));
const UpdatePlan = lazy(() => import('@/pages/plans/UpdatePlan'));

// Lazy load role pages
const Roles = lazy(() => import('@/pages/roles/Roles'));
const CreateRole = lazy(() => import('@/pages/roles/CreateRole'));
const UpdateRole = lazy(() => import('@/pages/roles/UpdateRole'));

// Lazy load user pages
const Users = lazy(() => import('@/pages/users/Users'));
const CreateUser = lazy(() => import('@/pages/users/CreateUser'));
const UpdateUser = lazy(() => import('@/pages/users/UpdateUser'));

// Lazy load other pages
const UserProfiles = lazy(() => import('@/pages/UserProfiles'));
const Calendar = lazy(() => import('@/pages/Calendar'));
const Blank = lazy(() => import('@/pages/Blank'));

// Lazy load form pages
const FormElements = lazy(() => import('@/pages/Forms/FormElements'));

// Lazy load table pages
const BasicTables = lazy(() => import('@/pages/Tables/BasicTables'));

// Lazy load UI element pages
const Alerts = lazy(() => import('@/pages/UiElements/Alerts'));
const Avatars = lazy(() => import('@/pages/UiElements/Avatars'));
const Badges = lazy(() => import('@/pages/UiElements/Badges'));
const Buttons = lazy(() => import('@/pages/UiElements/Buttons'));
const Images = lazy(() => import('@/pages/UiElements/Images'));
const Videos = lazy(() => import('@/pages/UiElements/Videos'));

// Lazy load chart pages
const LineChart = lazy(() => import('@/pages/Charts/LineChart'));
const BarChart = lazy(() => import('@/pages/Charts/BarChart'));

// Lazy load error pages
const NotFound = lazy(() => import('@/pages/OtherPage/NotFound'));
const Unauthorized = lazy(() => import('@/pages/OtherPage/Unauthorized'));

const AppContent = () => {
  const { toasts, closeToast } = useToast();

  return (
    <Router>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={closeToast} position="bottom-right" />
      <AuthProvider>
        <AuthAbilityProvider>
          <SWRConfig value={swrConfig}>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Protected Dashboard Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />

                {/* Companies */}
                <Route path="companies" element={<CompaniesList />} />
                <Route path="companies/create" element={<CreateCompany />} />
                <Route path="companies/:companyId/edit" element={<CreateCompany />} />
                <Route path="companies/:companyId/contacts" element={<ContactPersons />} />
                <Route path="companies/:companyId/bank-accounts" element={<BankAccounts />} />
                <Route path="companies/:companyId/addresses" element={<Addresses />} />

                {/* Customers */}
                <Route path="customers" element={<CustomersList />} />
                <Route path="customers/create" element={<CustomerForm />} />
                <Route path="customers/:customerId/edit" element={<CustomerForm />} />

                {/* Plans */}
                <Route path="plans/create" element={<CreatePlan />} />
                <Route path="plans/update" element={<UpdatePlan />} />
                <Route path="plans" element={<Plans />} />

                {/* Roles */}
                <Route path="roles/create" element={<CreateRole />} />
                <Route path="roles/update" element={<UpdateRole />} />
                <Route path="roles" element={<Roles />} />

                {/* Users */}
                <Route path="users/create" element={<CreateUser />} />
                <Route path="users/update" element={<UpdateUser />} />
                <Route path="users" element={<Users />} />

                {/* Customer Groups */}
                <Route path="customer-groups" element={<CustomerGroupsList />} />
                <Route path="customer-groups/create" element={<CreateCustomerGroup />} />
                <Route path="customer-groups/:groupId/edit" element={<CreateCustomerGroup />} />
                <Route path="customer-groups/:groupId/customers" element={<GroupCustomers />} />
                <Route path="customer-groups/:groupId/assign" element={<AssignCustomer />} />

                {/* Vendor Groups */}
                <Route path="vendor-groups" element={<VendorGroupsList />} />
                <Route path="vendor-groups/create" element={<VendorGroupForm />} />
                <Route path="vendor-groups/:groupId/edit" element={<VendorGroupForm />} />
                <Route path="vendor-groups/assign" element={<AssignVendor />} />

                {/* Vendors */}
                <Route path="vendors" element={<VendorsList />} />
                <Route path="vendors/create" element={<VendorForm />} />
                <Route path="vendors/:vendorId" element={<VendorDetail />} />
                <Route path="vendors/:vendorId/edit" element={<VendorForm />} />
                <Route path="vendors/:vendorId/invite" element={<SendInvitation />} />

                {/* Others Page */}
                <Route path="profile" element={<UserProfiles />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="blank" element={<Blank />} />

                {/* Forms */}
                <Route path="form-elements" element={<FormElements />} />

                {/* Tables */}
                <Route path="basic-tables" element={<BasicTables />} />

                {/* Ui Elements */}
                <Route path="alerts" element={<Alerts />} />
                <Route path="avatars" element={<Avatars />} />
                <Route path="badge" element={<Badges />} />
                <Route path="buttons" element={<Buttons />} />
                <Route path="images" element={<Images />} />
                <Route path="videos" element={<Videos />} />

                {/* Charts */}
                <Route path="line-chart" element={<LineChart />} />
                <Route path="bar-chart" element={<BarChart />} />
              </Route>

              {/* Guest Routes - Auth Pages */}
              <Route
                path="/signin"
                element={
                  <GuestRoute>
                    <SignIn />
                  </GuestRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <GuestRoute>
                    <SignUp />
                  </GuestRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <GuestRoute>
                    <ForgotPassword />
                  </GuestRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <GuestRoute>
                    <ResetPassword />
                  </GuestRoute>
                }
              />

              {/* Public Vendor Registration Routes */}
              <Route path="/register" element={<AcceptInvitation />} />
              <Route path="/vendors/complete-profile" element={<CompleteProfile />} />

              {/* Error Pages */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </SWRConfig>
        </AuthAbilityProvider>
      </AuthProvider>
    </Router>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
