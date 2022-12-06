import React from 'react';
import { Page, Navbar, Block, List, ListItem, useStore } from 'framework7-react';

const TenantsPage = () => {
  const tenants = useStore('tenants')
  return (
    <Page>
      <Navbar title="Tenants"/>
      <Block>
        <List>
          {tenants.map(tenant => (<ListItem key={tenant.id} link={`/tenants/${tenant.id}`} title={tenant.Name}>
            
          </ListItem>))}
        </List>
      </Block>
    </Page>
  );
}

export default TenantsPage;
