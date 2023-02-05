import React, { useState, useEffect } from 'react';

import {
  f7,
  f7ready,
  App,
  Panel,
  Views,
  Icon,
  View,
  Popup,
  Page,
  Navbar,
  Toolbar,
  NavRight,
  Link,
  Block,
  BlockTitle,
  LoginScreenTitle,
  List,
  ListItem,
  ListInput,
  ListButton,
  BlockFooter,
  useStore,
  Preloader
} from 'framework7-react';
import routes from '../js/routes';
import store from '../js/store';
import LoginPage from '../pages/login';
import { logout } from '../utils/firebase'
import TenantForm from './tenantForm';

const MyApp = () => {

  // Framework7 Parameters
  const f7params = {
    name: 'VLC Properties', // App name
    theme: 'auto', // Automatic theme detection
    // App store
    store: store,
    // App routes
    routes: routes,
  };

  const [selected, setSelected] = useState('properties')

  return (
    <App {...f7params} light>

      {/* Left panel with cover effect when hidden */}
      <Panel left cover light visibleBreakpoint={960}>
        <View>
          <Page>
            <Navbar title="VLC Properties" />
            <List menuList noHairlines>
              <ListItem link="/" view=".view-main" title="Properties" noChevron
                selected={selected === 'properties'}
                onClick={() => setSelected('properties')}
              >
                <Icon slot="media" material="home"></Icon>
              </ListItem>
              <ListItem link="/expenses/" view=".view-main" p title="Balance sheet" noChevron
                selected={selected === 'expenses'}
                onClick={() => setSelected('expenses')}
              >
                <Icon slot="media" material="money_off"></Icon>
              </ListItem>
              <ListItem link="/bookings/" view=".view-main" p title="Bookings" noChevron
                selected={selected === 'bookings'}
                onClick={() => setSelected('bookings')}
              >
                <Icon slot="media" material="card_travel"></Icon>
              </ListItem>
              <ListItem link="/tenants/" view=".view-main" p title="Tenants" noChevron
                selected={selected === 'tenants'}
                onClick={() => setSelected('tenants')}
              >
                <Icon slot="media" material="person_search"></Icon>
              </ListItem>
              <ListItem link="/settings/" view=".view-main" p title="Settings" noChevron
                selected={selected === 'settings'}
                onClick={() => setSelected('settings')}
              >
                <Icon slot="media" material="settings"></Icon>
              </ListItem>
              <ListItem link="#" view=".view-main" p title="Log out" noChevron onClick={() => logout()}>
                <Icon slot="media" material="logout"></Icon>
              </ListItem>
            </List>
          </Page>
        </View>
      </Panel>

      {/* Your main view, should have "view-main" class */}
      <View main className="safe-areas" url="/" />
      <LoginPage />
      <TenantForm />
    </App>
  )
}
export default MyApp;