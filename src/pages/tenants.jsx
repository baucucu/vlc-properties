import React, {useEffect,useState} from 'react';
import {f7, Page, Navbar, PhotoBrowser, Block, List, ListItem, ListInput,ListButton, Button, NavRight, Icon, useStore, Popup, Row, Col } from 'framework7-react';
import { PickerInline,PickerDropPane, PickerOverlay   } from 'filestack-react';

const TenantsPage = () => {
  const tenants = useStore('tenants')
  const [popupOpen, setPopupOpen] = useState(false)
  
  
  function handleClose(){
    setPopupOpen(false)
  }

  function AddTenant({handleClose}){
    const [canSave, setCanSave] = useState(false)
    const [formData, setFormData] = useState({})
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploads,setUploads] = useState([])
    
    const options = {
      displayMode: 'inline',
      container: '#picker',
      maxFiles: 20,
      uploadInBackground: false,
      onUploadDone: (res) => console.log(res),
    };

    function handleSave() {
      f7.store.dispatch('addTenant',formData)
      handleClose()
    }
    function handleChange(){
      let data = f7.form.convertToData('#newTenantForm')
      console.log({data})
      setFormData(data)
    }
    useEffect(() => {
      console.log("formData changed: ",{formData})
      let emptyFields = Object.keys(formData).filter(key => formData[key] === '' && key !== 'notes')
      console.log({emptyFields})
      if(emptyFields.length === 0){setCanSave(true)} else {setCanSave(false)}
    }, [formData])
    
    return(
      <Page>
        <Navbar title="Add new tenant">
          {canSave && <Button onClick={handleSave}><Icon material='save'/></Button>}
          <NavRight>
            <Button onClick={handleClose}>
              <Icon  material="close"></Icon>
            </Button>
          </NavRight>
        </Navbar>
        <form id="newTenantForm" className="form-store-data">
          <Block>
            <Row>
              <Col>
                <List noHairlines>
                  <ListItem >
                      <h2 slot="header">Contact details</h2>
                  </ListItem> 
                  <ListInput name="name" label="Name" onChange={handleChange} >
                  </ListInput>
                  <ListInput name="phone" label="Phone"  onChange={handleChange}>
                  </ListInput>
                  <ListInput name="email" label="Email"  onChange={handleChange}>
                  </ListInput>
                  <ListInput name="address" label="Permanent address" onChange={handleChange}>
                  </ListInput>
                </List>
              </Col>
              <Col>
                <Block>
                  <List noHairlines>
                    <ListItem >
                        <h2 slot="header">ID</h2>
                    </ListItem>
                    <ListInput 
                        name="idNumber"
                        label="ID number"
                        onChange={handleChange}
                    >
                    </ListInput>
                    <PhotoBrowser photos={uploads.map(file => file.url)} ref={standalone} />    
                  </List>
                </Block>
              </Col>
            </Row>
            <Button onClick={()=> setPickerOpen(true)}>Upload files</Button>
              {pickerOpen && <PickerInline 
                apikey={import.meta.env.VITE_FILESTACK_KEY}
                // onSuccess={(res) => console.log(res)}
                onUploadDone={(res) => {
                  console.log(res);
                  setUploads(res.filesUploaded)
                  setPickerOpen(false)
                }}
              />}
            <List>
              <ListItem >
                  <h2 slot="header">Notes</h2>
              </ListItem>
              <ListInput
                  name="notes"
                  type="textarea"
                  resizable
                  placeholder="Enter notes here"
                  onChange={handleChange}
              >
                  <Icon material="notes" slot="media"/>  
              </ListInput>
            </List>
          </Block>
        </form>
      </Page>
    )
  }

  return (
    <Page>
      <Navbar title="Tenants">
        <Button onClick={() => setPopupOpen(true)}><Icon material="add" ></Icon></Button>
      </Navbar>
      <Block>
        <List>
          {tenants.map(tenant => (<ListItem key={tenant.id} link={`/tenants/${tenant.id}`} title={tenant.Name}>
            
          </ListItem>))}
        </List>
      </Block>
      <Popup
        className="newTenant"
        opened={popupOpen}
        onPopupClosed={handleClose}
        onPopupSwipeClose={handleClose}
        onPopupClose={handleClose}
      >
        <AddTenant handleClose={handleClose}/>
      </Popup>
    </Page>
  );
}

export default TenantsPage;
