
import NotFoundPage from '../pages/404.jsx';

import PropertyPage from '../pages/property.jsx';
import PropertiesPage from '../pages/properties.jsx';
import BookingsPage from '../pages/bookings.jsx';
import BookingPage from '../pages/booking.jsx';
import TenantsPage from '../pages/tenants.jsx';
import TenantPage from '../pages/tenant.jsx';
import ExpensesPage from '../pages/expenses.jsx';
import SettingsPage from '../pages/settings.jsx';

var routes = [
  {
    path: '/',
    component: PropertiesPage,
  },
  {
    path: '/properties/:id',
    component: PropertyPage
  },
  {
    path: '/bookings/',
    component: BookingsPage
  },
  {
    path: '/settings/',
    component: SettingsPage
  },
  {
    path: '/bookings/:id',
    component: BookingPage,
  },
  {
    path: '/expenses/',
    component: ExpensesPage
  },
  {
    path: '/tenants/',
    component: TenantsPage
  },
  {
    path: '/tenants/:id',
    component: TenantPage
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
