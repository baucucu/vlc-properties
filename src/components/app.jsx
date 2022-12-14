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
  LoginScreen,
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

  useEffect(() => {
    store.dispatch('getSettings');
  }, [])

  return (
    <App {...f7params} light>

      {/* Left panel with cover effect when hidden */}
      <Panel left cover light visibleBreakpoint={960}>
        <View>
          <Page>
            <Navbar title="VLC Properties" />
            <List>
              <ListItem link="/" view=".view-main" title="Properties" noChevron>
                <Icon slot="media" material="home"></Icon>
              </ListItem>
              <ListItem link="/expenses/" view=".view-main" p title="Expenses" noChevron >
                <Icon slot="media" material="money_off"></Icon>
              </ListItem>
              <ListItem link="/bookings/" view=".view-main" p title="Bookings" noChevron >
                <Icon slot="media" material="card_travel"></Icon>
              </ListItem>
              <ListItem link="/tenants/" view=".view-main" p title="Tenants" noChevron>
                <Icon slot="media" material="person_search"></Icon>
              </ListItem>
            </List>
          </Page>
        </View>
      </Panel>

      {/* Your main view, should have "view-main" class */}
      <View main className="safe-areas" url="/" />

    </App>
  )
}
export default MyApp;