import React, {useEffect, useState} from 'react';
import { Page, Navbar, Block, BlockTitle, List, ListItem, useStore, Row, Col, ListInput, Icon, Button, f7 } from 'framework7-react';
import store from '../js/store';

const TenantPage = ({f7route}) => {
  const tenants = useStore('tenants')
  
  const [tenant,setTenant] = useState(tenants.filter(item => item.id === f7route.params.id)[0])
  const [formData, setFormData] = useState()
  const [readOnly, setReadOnly] = useState(true)
  useEffect(() => {
    setTenant(tenants.filter(item => item.id === f7route.params.id)[0])
  },[tenants])
  useEffect(() => {
    setFormData({
        phone: tenant.Phone,
        email: tenant.Email,
        address: tenant["Permanent address"],
        idNumber: tenant["Passport / ID number"],
        notes: tenant.Notes,
        // idFile: tenant["Passport / ID file"][0].url
    })
    f7.form.fillFromData("#tenantForm",formData)
  },[])

  const handleSave = () => {
    let data = f7.form.getFormData('#tenantForm')
    if(JSON.stringify(data) !== JSON.stringify(formData)){
        store.dispatch('saveTenant',{recordId: tenant.id, ...data, name:tenant.Name})
    }
    setReadOnly(true)
  }

  const handleCancel = () => {
    f7.form.fillFromData('#tenantForm', formData)
    setReadOnly(true)
  }
  
  return (
    <Page>
      <Navbar title={tenant.Name} backLink style={{gap:16}}>
        {readOnly && <Button onClick={() => setReadOnly(false)}>Edit</Button>}
        {readOnly || <div style={{display:"flex", gap:16}}>
            <Button bgColor="teal" onClick={handleSave}>Save</Button>
            <Button bgColor="red" onClick={handleCancel}>Cancel</Button>
        </div>}
      </Navbar>
      <Block>
        <form id="tenantForm" className="form-store-data">
            <Row>
                <Col>
                    <List noHairlines>
                        <ListItem >
                            <h2 slot="header">Contact details</h2>
                        </ListItem>
                        <ListInput name="phone" label="Phone"  disabled={readOnly}>
                        </ListInput>
                        
                        <ListInput name="email" label="Email"  disabled={readOnly}>
                        </ListInput>
                        
                        <ListInput name="address" label="Permanent address" disabled={readOnly}>
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
                                
                                disabled={readOnly}
                            >
                            </ListInput>
                            <ListItem>
                                <img src={tenant["Passport / ID file"]?.[0].url} style={{maxHeight:"20vh", maxWidth:"100%"}}/>
                            </ListItem>         
                        </List>
                    </Block>
                </Col>
            </Row>
            <List>
                <ListItem >
                    <h2 slot="header">Notes</h2>
                </ListItem>
                <ListInput
                    name="notes"
                    type="textarea"
                    resizable
                    placeholder="Enter notes here"
                    disabled={readOnly} 
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
