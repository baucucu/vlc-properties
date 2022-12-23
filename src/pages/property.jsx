import React, { useState, useEffect } from 'react';
import { Page, Navbar, Icon, Button, Block, List, ListItem, ListInput } from 'framework7-react';
import useFirestoreListener from "react-firestore-listener"
import { auth } from '../utils/firebase'



const PropertyPage = ({ f7route }) => {

  useEffect(() => {
    console.log({ properties, params: f7route.params })
    properties.length > 0 && setProperty(properties.filter(item => item.docId === f7route.params.id)[0])
  }, [properties])

  return (
    <Page>
      <Navbar title={`${property?.name}`} backLink />
      {property && <Block >
        <List noHairlines>
          <ListInput defaultValue={property.name} >
            <small slot='label'>Name</small>
          </ListInput>
          <ListItem title={property?.contractTemplate || "No template selected"} onClick={() => handleOpenPicker()}>
            <small slot='header'>Contract template</small>
          </ListItem>

        </List>
      </Block>}
    </Page>
  );
}

export default PropertyPage;
