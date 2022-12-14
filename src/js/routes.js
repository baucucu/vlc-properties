
import HomePage from '../pages/home.jsx';
import AboutPage from '../pages/about.jsx';
import FormPage from '../pages/form.jsx';

import LeftPage1 from '../pages/left-page-1.jsx';
import LeftPage2 from '../pages/left-page-2.jsx';
import DynamicRoutePage from '../pages/dynamic-route.jsx';
import RequestAndLoad from '../pages/request-and-load.jsx';
import NotFoundPage from '../pages/404.jsx';

import PropertyPage from '../pages/property.jsx';
import PropertiesPage from '../pages/properties.jsx';
import BookingsPage from '../pages/bookings.jsx';
import BookingPage from '../pages/booking.jsx';
import TenantsPage from '../pages/tenants.jsx';
import TenantPage from '../pages/tenant.jsx';
import ExpensesPage from '../pages/expenses.jsx';
import SettingsPage from '../pages/settings.jsx';

import { f7 } from 'framework7-react';

var routes = [
  {
    path: '/',
    component: PropertiesPage,
  },
  {
    path: '/property/:propertyId',
    async: function ({ router, to, resolve }) {
      const app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      const { propertyId } = to.params;

      app.preloader.hide();
      resolve(
        {
          component: PropertyPage,
        },
        {
          props: {
            property: f7.store.state.properties.filter(property => property.id === propertyId)[0],
          }
        }
      );
    },
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
    path: '/bookings/:bookingId',
    async: function ({ router, to, resolve }) {
      const app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      const { bookingId } = to.params;
      console.log()
      app.preloader.hide();
      f7.store.dispatch("getBooking", bookingId)
      resolve(
        {
          component: BookingPage,
        }
      );
    },
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
    path: '/about/',
    component: AboutPage,
  },
  {
    path: '/form/',
    component: FormPage,
  },

  {
    path: '/left-page-1/',
    component: LeftPage1,
  },
  {
    path: '/left-page-2/',
    component: LeftPage2,
  },
  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: DynamicRoutePage,
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function ({ router, to, resolve }) {
      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = to.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            component: RequestAndLoad,
          },
          {
            props: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
