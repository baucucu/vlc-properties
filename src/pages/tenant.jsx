import React, {useEffect} from 'react';
import { Page, Navbar, Block, List, ListItem, useStore, Row, Col, BlockTitle } from 'framework7-react';

const TenantPage = ({f7route}) => {
  const tenants = useStore('tenants')
  const tenant = tenants.filter(item => item.id === f7route.params.id)[0]
  console.log({tenant})
  useEffect(() => {
    
  },[])
  return (
    <Page>
      <Navbar title={tenant.Name} backLink/>
      <Block>
        <Row>
            <Col>
                <List>
                    <ListItem>
                        <h2 slot="header">Phone</h2>
                        <p slot="title">{tenant.Phone}</p>
                    </ListItem>
                    <ListItem>
                        <h2 slot="header">Email</h2>
                        <p slot="title">{tenant.Email}</p>
                    </ListItem>
                    <ListItem>
                        <h2 slot="header">Address</h2>
                        <p slot="title">{tenant["Permanent address"]}</p>
                    </ListItem>
                </List>
            </Col>
            <Col>
                <Block>
                    <List>
                        <ListItem>
                            <h2 slot="header">ID</h2>
                            <p slot="title">{tenant["Passport / ID number"]}</p>
                        </ListItem>
                    </List>
                    <img src={tenant["Passport / ID file"]?.[0].url} style={{maxHeight:"20vh", maxWidth:"100%"}}/>
                </Block>
            </Col>
        </Row>
        <List>
            <ListItem >
                <h2 slot="header">Notes</h2>
                <p slot="title">{tenant.Notes}</p>
            </ListItem>
        </List>
      </Block>
    </Page>
  );
}

export default TenantPage;
