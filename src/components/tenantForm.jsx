import React, { useState, useEffect } from 'react';
import { Page, LoginScreen, Block, BlockTitle, List, ListItem, useStore, Row, Col, ListInput, Icon, Button, f7, NavRight, Popup } from 'framework7-react';
import useFirestoreListener from 'react-firestore-listener';
import { PickerInline, PickerOverlay } from 'filestack-react';
import { arrayRemove } from 'firebase/firestore';
import { db, collection, onSnapshot, addToSubcollection, removeFromSubcollection } from '../utils/firebase';
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
        console.log({ tenant })
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

    async function handleSave() {
        let data = f7.form.convertToData('#tenantForm')
        console.log({ data })
        if (JSON.stringify(data) !== JSON.stringify(tenant)) {
            f7.store.dispatch('updateOne', { collectionName: 'tenants', id: tenant.docId, payload: { ...data } }).then(async res => {
                let promises = uploads.map(async file => {
                    console.log({ saving: file })
                    return await addToSubcollection({
                        tenantId: tenant.docId,
                        fileId: file.handle,
                        payload: file
                    })
                })
                return await Promise.all(promises).then(res => {
                    f7.dialog.alert('Your information has been saved. You can now close this window.', 'Success', () => {
                        window.close()
                    })
                    return res
                })
            })
        }
        setReadOnly(true)
    }


    async function handleUploadDelete(id) {
        console.log({ id })
        f7.preloader.show()
        return await removeFromSubcollection({
            tenantId: tenant.docId,
            fileId: id
        })
    }


    return (
        <LoginScreen
            id="tenantFormScreen"
            opened={tenantId}
        >
            <Block>
                <form id="tenantForm" className="form-store-data infinite-scroll-content">
                    <Row>
                        <List noHairlines className='col' style={{ marginTop: 0 }}>
                            <ListInput label="Name" type="text" name="name" placeholder="Name" />
                            <ListInput label="Email" type="email" name="email" placeholder="Email" />
                            <ListInput label="Phone" type="tel" name="phone" placeholder="Phone" />
                        </List>
                        <List noHairlines className='col' style={{ marginTop: 0 }}>
                            <ListInput label="Address" type="text" name="address" placeholder="Address" />
                            <ListInput label="Country" type="text" name="country" placeholder="Country" />
                            <ListInput label="National ID Number" type="text" name="idNumber" placeholder="National ID Number" />
                        </List>
                    </Row>
                    <Row>

                        {uploads?.length > 0 && <List noHairlines style={{ marginTop: 0 }}>
                            <ListItem >
                                <h2 slot="header">Files</h2>
                            </ListItem>
                            {uploads.map(file => <ListItem key={file.id || file.handle} mediaItem title={file.filename}>
                                <img src={file.url} width={40} slot="media" />
                                <Button slot='content-end' onClick={() => handleUploadDelete(file.handle)}><Icon material='delete'></Icon></Button>
                            </ListItem>)}
                        </List>}
                    </Row>
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
                </form >
            </Block>
        </LoginScreen >
    )
}