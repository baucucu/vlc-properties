import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, BlockTitle, List, ListItem, useStore, Row, Col, ListInput, Icon, Button, f7, NavRight } from 'framework7-react';
import store from '../js/store';
import { PickerInline, PickerOverlay } from 'filestack-react';
import useFirestoreListener from "react-firestore-listener"
import { db, addToSubcollection, removeFromSubcollection, collection, onSnapshot } from '../utils/firebase'
import RequestForm from '../components/requestForm'
import { FileIcon } from '@drawbotics/file-icons';

const TenantPage = ({ f7route }) => {
  const tenants = useFirestoreListener({ collection: "tenants" })
  const bookings = useFirestoreListener({ collection: "bookings" })
  const [readOnly, setReadOnly] = useState(true)
  const [tenant, setTenant] = useState()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploads, setUploads] = useState(tenant?.uploads || [])
  const [requestPopupOpen, setRequestPopupOpen] = useState(false)

  useEffect(() => {
    setTenant(tenants.filter(item => item.docId === f7route.params.id)[0])
  }, [tenants])

  useEffect(() => {
    // console.log({ tenant })
    if (tenant) {
      f7.form.fillFromData("#tenantForm", tenant)
      let uploadsRef = collection(db, "tenants", tenant.docId, "uploads");

      onSnapshot(uploadsRef, (querySnapshot) => {
        setUploads([])
        querySnapshot.forEach((doc) => {
          setUploads(uploads => [...uploads, doc.data()])
        });
      });
    }
  }, [tenant])

  const handleSave = async () => {
    let data = f7.form.convertToData('#tenantForm')
    // console.log({ data })
    if (JSON.stringify(data) !== JSON.stringify(tenant)) {
      f7.store.dispatch('updateOne', { collectionName: 'tenants', id: tenant.docId, payload: { ...data } }).then(async res => {
        let promises = uploads.map(async file => {
          // console.log({ saving: file })
          return await addToSubcollection({
            tenantId: tenant.docId,
            fileId: file.handle,
            payload: file
          })
        })
        return await Promise.all(promises).then(res => {
          f7.dialog.alert('Tenant information saved.')
          return res
        })
      })
    }
    setReadOnly(true)
  }

  const handleCancel = () => {
    f7.form.fillFromData('#tenantForm', tenant)
    setReadOnly(true)
  }

  function handleDelete() {
    f7.dialog.confirm('Are you sure you want to delete this tenant? This action will also delete all bookings for this tenant!', () => {
      f7.store.dispatch('deleteOne', { collectionName: 'tenants', id: tenant.docId }).then(res => {
        let tenantBookings = bookings.filter(booking => booking.tenant.id === tenant.docId)
        tenantBookings.forEach(booking => {
          f7.store.dispatch('deleteOne', { collectionName: 'bookings', id: booking.docId })
        })
        f7.views.main.router.back()
      })
    })
  }

  async function handleUploadDelete(id) {
    // console.log({ id })
    f7.preloader.show()
    return await removeFromSubcollection({
      tenantId: tenant.docId,
      fileId: id
    })
  }

  function handleRequestPopupClose() {
    setRequestPopupOpen(false)
  }

  return (
    <Page>
      <Navbar title={tenant?.name} backLink style={{ gap: 16 }}>
        {readOnly && <Button onClick={() => setReadOnly(false)}><Icon material='edit' /></Button>}
        {readOnly && <Button onClick={() => { setRequestPopupOpen(true) }}><Icon material="contact_mail" /></Button>}
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
            {uploads.map(file => <ListItem key={file.id || file.handle} mediaItem>
              <a href={file.url} className='link external' target="blank" slot='title'>{file.filename}</a>
              <FileIcon file={file.filename.split('.').pop()} slot='media' style={{ width: 44 }} />
              {readOnly || <Button slot='content-end' onClick={() => handleUploadDelete(file.handle)}><Icon material='delete'></Icon></Button>}
            </ListItem>)}
          </List>}
          {readOnly || <Button onClick={() => setPickerOpen(true)}>Add files</Button>}
          {pickerOpen && <PickerOverlay
            apikey={import.meta.env.VITE_FILESTACK_KEY}
            pickerOptions={{}}
            onUploadDone={(res) => {
              // console.log(res);
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
      {tenant && <RequestForm requestPopupOpen={requestPopupOpen} handleRequestPopupClose={handleRequestPopupClose} tenant={tenant} />}
    </Page>
  );
}

export default TenantPage;
