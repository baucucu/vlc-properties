import React, { useState, useEffect } from 'react';
import { Page, LoginScreen, Block, BlockTitle, List, ListItem, useStore, Row, Col, ListInput, Icon, Button, f7, NavRight, Popup } from 'framework7-react';
import useFirestoreListener from 'react-firestore-listener';
import { PickerInline, PickerOverlay } from 'filestack-react';
export default function TenantForm() {

    const tenants = useFirestoreListener({ collection: 'tenants' })
    const tenantId = useStore('tenantId')
    const [tenant, setTenant] = useState(null)
    const [readOnly, setReadOnly] = useState(true)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploads, setUploads] = useState([])



    useEffect(() => {
        if (tenantId && tenants.length > 0) {
            setTenant(tenants.filter(item => item.docId === tenantId)[0])
            setUploads(tenants.filter(item => item.docId === tenantId)[0]?.uploads || [])
        }
    }, [tenantId, tenants])

    useEffect(() => {
        console.log({ tenantForm: tenant })
        f7.form.fillFromData('#tenantForm', tenant)
    }, [tenant])

    function handleSave() {
        let data = f7.form.convertToData('#tenantForm')
        data.uploads = uploads
        f7.preloader.show()
        f7.store.dispatch('updateOne', { collectionName: 'tenants', id: tenant.docId, payload: data }).then(res => {
            f7.preloader.hide()
            f7.dialog.alert('Data updated successfully. You can close this window now.')
        })
    }

    return (
        <LoginScreen
            id="tenantFormScreen"
            opened={tenantId}
        >
            <Block>
                <form id="tenantForm" className="form-store-data">
                    <List noHairlines>
                        <ListInput label="Name" type="text" name="name" placeholder="Name" />
                        <ListInput label="Email" type="email" name="email" placeholder="Email" />
                        <ListInput label="Phone" type="tel" name="phone" placeholder="Phone" />
                        <ListInput label="Address" type="text" name="address" placeholder="Address" />
                        <ListInput label="Country" type="text" name="country" placeholder="Country" />
                        <ListInput label="idNumber" type="text" name="idNumber" placeholder="idNumber" />
                        {uploads?.length > 0 && <List noHairlines>
                            <ListItem >
                                <h2 slot="header">Files</h2>
                            </ListItem>
                            {uploads.map(file => <ListItem key={file.id || file.handle} mediaItem title={file.filename}>
                                <img src={file.url} width={40} slot="media" />
                            </ListItem>)}
                        </List>}
                        <Button onClick={() => setPickerOpen(true)}>Add files</Button>
                        {pickerOpen && <PickerOverlay
                            apikey={import.meta.env.VITE_FILESTACK_KEY}
                            pickerOptions={{}}
                            onUploadDone={(res) => {
                                console.log(res);
                                setUploads([...uploads, ...res.filesUploaded])
                                setPickerOpen(false)
                            }}
                        />}
                        <Button fill raised onClick={() => handleSave()}>Save</Button>
                    </List>
                </form>
            </Block>
        </LoginScreen>
    )
}