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
  // Login screen demo data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Framework7 Parameters
  const f7params = {
    name: 'VLC Properties', // App name
      theme: 'auto', // Automatic theme detection
      // App store
      store: store,
      // App routes
      routes: routes,
  };
  const alertLoginData = () => {
    f7.dialog.alert('Username: ' + username + '<br>Password: ' + password, () => {
      f7.loginScreen.close();
    });
  }
  f7ready(() => {
    // Call F7 APIs here
  });

  const [properties, setProperties] = useState([])

  useEffect(()=>{
    store.dispatch('getProperties');
    // store.dispatch('getUnits');
    // store.dispatch('getTenants');
    // store.dispatch('getExpenses');
    // store.dispatch('getRevenue');
    // store.dispatch('getBookings');
    // store.dispatch('getSelected');
  },[])
  return (
    <App { ...f7params } light>

        {/* Left panel with cover effect when hidden */}
        <Panel left cover light visibleBreakpoint={960}>
          <View>
            <Page>
              <Navbar title="VLC Properties"/>
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


        {/* Right panel with reveal effect*/}
        <Panel right reveal dark>
          <View>
            <Page>
              <Navbar title="Right Panel"/>
              <Block>Right panel content goes here</Block>
            </Page>
          </View>
        </Panel>


        {/* Your main view, should have "view-main" class */}
        <View main className="safe-areas" url="/" />

      {/* Popup */}
      <Popup id="my-popup">
        <View>
          <Page>
            <Navbar title="Popup">
              <NavRight>
                <Link popupClose>Close</Link>
              </NavRight>
            </Navbar>
            <Block>
              <p>Popup content goes here.</p>
            </Block>
          </Page>
        </View>
      </Popup>

      <LoginScreen id="my-login-screen">
        <View>
          <Page loginScreen>
            <LoginScreenTitle>Login</LoginScreenTitle>
            <List form>
              <ListInput
                type="text"
                name="username"
                placeholder="Your username"
                value={username}
                onInput={(e) => setUsername(e.target.value)}
              ></ListInput>
              <ListInput
                type="password"
                name="password"
                placeholder="Your password"
                value={password}
                onInput={(e) => setPassword(e.target.value)}
              ></ListInput>
            </List>
            <List>
              <ListButton title="Sign In" onClick={() => alertLoginData()} />
              <BlockFooter>
                Some text about login information.<br />Click "Sign In" to close Login Screen
              </BlockFooter>
            </List>
          </Page>
        </View>
      </LoginScreen>
    </App>
  )
}
export default MyApp;