import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, BlockTitle, List, ListItem, useStore, Row, Col, ListInput, Icon, Button, f7, NavRight } from 'framework7-react';
import store from '../js/store';
import { PickerInline } from 'filestack-react';
import useFirestoreListener from "react-firestore-listener"


const TenantPage = ({ f7route }) => {
  const tenants = useFirestoreListener({ collection: "tenants" })
  const [readOnly, setReadOnly] = useState(true)
  const [tenant, setTenant] = useState()
  console.log({ tenant })
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploads, setUploads] = useState(tenant?.uploads || [])
  console.log({ tenant })

  useEffect(() => {
    setTenant(tenants.filter(item => item.docId === f7route.params.id)[0])
  }, [tenants])

  useEffect(() => {
    f7.form.fillFromData("#tenantForm", tenant)
    setUploads(tenant?.uploads || [])
  }, [tenant])

  const handleSave = () => {
    let data = f7.form.convertToData('#tenantForm')
    console.log({ data })
    if (JSON.stringify(data) !== JSON.stringify(tenant)) {
      setUploads(tenant.up)
      store.dispatch('updateOne', { collectionName: 'tenants', id: tenant.docId, payload: { ...data, uploads } })
    }
    setReadOnly(true)
  }

  const handleCancel = () => {
    f7.form.fillFromData('#tenantForm', initialData)
    setReadOnly(true)
  }

  function handleDelete() {
    f7.dialog.confirm('Are you sure you want to delete this tenant?', () => {
      store.dispatch('deleteOne', { collectionName: 'tenants', id: tenant.docId })
      f7.views.main.router.back()
    })
  }

  return (
    <Page>
      <Navbar title={tenant?.name} backLink style={{ gap: 16 }}>
        {readOnly && <Button onClick={() => setReadOnly(false)}><Icon material='edit' /></Button>}
        {readOnly || <Button small onClick={handleSave}><Icon material='save' /></Button>}
        {readOnly || <Button small onClick={handleDelete}>Delete</Button>}
        {readOnly || <NavRight>
          <Button small onClick={handleCancel}><Icon material='close' /></Button>
        </NavRight>}
      </Navbar>
      {tenant && <Block>
        <form id="tenantForm" className="form-store-data">
          <Row>
            <List noHairlines className='col'>
              <ListInput name="name" label="Name" readonly={readOnly} />
              <ListInput name="email" label="Email" readonly={readOnly} />
              <ListInput name="phone" label="Phone" readonly={readOnly} />
            </List>

            <List noHairlines className='col'>
              <ListInput name="country" label="Country" readonly={readOnly} />
              <ListInput
                name="idNumber"
                label="ID number"
                readonly={readOnly}
              />

            </List>
          </Row>
          <List noHairlines>
            <ListInput name="address" label="Permanent address" readonly={readOnly} />
          </List>
          {uploads?.length > 0 && <List noHairlines>
            <ListItem >
              <h2 slot="header">Files</h2>
            </ListItem>
            {uploads.map(file => <ListItem key={file.id || file.handle} mediaItem title={file.filename}>
              <img src={file.url} width={40} slot="media" />
            </ListItem>)}
          </List>}
          {readOnly || <Button onClick={() => setPickerOpen(true)}>Add files</Button>}
          {pickerOpen && <PickerInline
            apikey={import.meta.env.VITE_FILESTACK_KEY}
            pickerOptions={{}}
            onUploadDone={(res) => {
              console.log(res);
              setUploads([...uploads, ...res.filesUploaded])
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
              <Icon material="notes" slot="media" />
            </ListInput>
          </List>
        </form>
      </Block>}
    </Page>
  );
}

export default TenantPage;
