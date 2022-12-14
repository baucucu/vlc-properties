import React, {useEffect, useState} from 'react';
import { Page, Navbar, Block, BlockTitle, List, ListItem, useStore, Row, Col, ListInput, Icon, Button, f7, NavRight } from 'framework7-react';
import store from '../js/store';
import { PickerInline,PickerDropPane, PickerOverlay   } from 'filestack-react';


const TenantPage = ({f7route}) => {
  const tenants = useStore('tenants')
  const [readOnly, setReadOnly] = useState(true)
  const tenant = tenants.filter(item => item.id === f7route.params.id)[0]
  const [pickerOpen,setPickerOpen] = useState(false)
  const [uploads, setUploads] = useState(tenant.Files)
  console.log({tenant})
  const initialData = {
    name: tenant.Name,
    phone: tenant.Phone,
    email: tenant.Email,
    address: tenant["Permanent address"],
    idNumber: tenant["Passport / ID number"],
    notes: tenant.Notes,
    // idFile: tenant["Passport / ID file"][0].url
  }   
  useEffect(() => {
    console.log({f7route})
    f7.form.fillFromData("#tenantForm",initialData)
  },[])

  const handleSave = () => {
    let data = f7.form.getFormData('#tenantForm')
    console.log({data})
    if(JSON.stringify(data) !== JSON.stringify(initialData)){
        store.dispatch('saveTenant',{recordId: tenant.id, ...data, name:tenant.Name, uploads})
    }
    setReadOnly(true)
  }

  const handleCancel = () => {
    f7.form.fillFromData('#tenantForm', initialData)
    setReadOnly(true)
  }
  
  return (
    <Page>
      <Navbar title={tenant.Name} backLink style={{gap:16}}>
        {readOnly && <Button onClick={() => setReadOnly(false)}><Icon material='edit'/></Button>}
        {readOnly || <Button small onClick={handleSave}><Icon  material='save'/></Button>}
        {readOnly || <NavRight>
           <Button small onClick={handleCancel}><Icon material='close'/></Button>
          </NavRight>}
      </Navbar>
      <Block>
        <form id="tenantForm" className="form-store-data">
        <Row>
              <Col>
                <List noHairlines>
                  <ListInput name="name" label="Name"  readonly={readOnly}/>
                  <ListInput name="email" label="Email" readonly={readOnly} />
                  
                </List>
              </Col>
              <Col>
                <Block>
                  <List noHairlines>
                    <ListInput name="phone" label="Phone" readonly={readOnly}/>
                    <ListInput 
                        name="idNumber"
                        label="ID number"
                        readonly={readOnly}
                    />
                    
                  </List>
                </Block>
              </Col>
            </Row>
            <Row>
              <Col>
                <List noHairlines>
                  <ListInput name="address" label="Permanent address" readonly={readOnly} />
                </List>
              </Col>
            </Row>
            <List noHairlines>
              <ListItem >
                  <h2 slot="header">Files</h2>
              </ListItem>
              {uploads.map(file => <ListItem key={file.id || file.handle} mediaItem title={file.filename}>
                <img src={file.url} width={40} slot="media"/>
              </ListItem>)}
            </List>
            {readOnly || <Button onClick={()=> setPickerOpen(true)}>Add files</Button>}
            {pickerOpen && <PickerInline 
                apikey={import.meta.env.VITE_FILESTACK_KEY}
                pickerOptions={{}}
                onUploadDone={(res) => {
                console.log(res);
                setUploads([...uploads,...res.filesUploaded])
                setPickerOpen(false)
              }}
            />}
            <List noHairlines>
                <ListItem >
                    <h2 slot="header">Notes</h2>
                </ListItem>
                <ListInput
                    name="notes"
                    type="textarea"
                    resizable
                    placeholder="Enter notes here"
                    readonly={readOnly} 
                >
                    <Icon material="notes" slot="media"/>  
                </ListInput>
            </List>
        </form>
      </Block>
    </Page>
  );
}

export default TenantPage;
