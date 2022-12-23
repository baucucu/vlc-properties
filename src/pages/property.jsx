import React, { useState, useEffect } from 'react';
import { Page, Navbar, Icon, Button, Block, List, ListItem, ListInput } from 'framework7-react';
import useFirestoreListener from "react-firestore-listener"
import { auth } from '../utils/firebase'
import Drive from 'react-drive';



const PropertyPage = ({ f7route }) => {

  const properties = useFirestoreListener({ collection: "properties" })
  const [property, setProperty] = useState()
  const token = auth.currentUser.getIdToken()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log({ properties, params: f7route.params })
    properties.length > 0 && setProperty(properties.filter(item => item.docId === f7route.params.id)[0])
  }, [properties])

  function handleEvent(event, payload) {
    if (event === 'START_REMOTE_PULL') {
      setLoading(true);
    }
    if (event === 'SELECTED_FILES') {
      setFiles(payload.files)
    }
  }
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
          <div className="library-copy">
            <Drive
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
              token={token}
              onEvent={() => handleEvent()}
            >
              <button className="">Select Drive Files</button>
            </Drive>
            {loading && <div className="loader" />}
            {files.length && files.map(file => <p>{file.name}</p>)}
          </div>
        </List>
      </Block>}
    </Page>
  );
}

export default PropertyPage;
