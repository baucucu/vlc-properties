import React, { useState, useEffect } from 'react';
import { Page, Navbar, Button, Block, List, ListItem, ListInput, Stepper, Icon, Popup, NavRight, Row, Col, f7 } from 'framework7-react';
import _ from 'lodash'
import { createOne, updateOne } from '../utils/firebase';
import { doc } from 'firebase/firestore'
import { db } from '../utils/firebase'
import useFirestoreListener from "react-firestore-listener"


const SettingsPage = () => {
    const properties = useFirestoreListener({ collection: "properties" })
    const settings = useFirestoreListener({ collection: "settings" })

    const [editProperties, setEditProperties] = useState(false)
    const [editedProperties, setEditedProperties] = useState([])

    const [editChannels, setEditChannels] = useState(false)
    const [editedChannels, setEditedChannels] = useState([])
    const [canSaveChannels, setCanSaveChannels] = useState(false)

    const [editedCategories, setEditedCategories] = useState([])
    const [editCategories, setEditCategories] = useState(false)
    const [canSaveCategories, setCanSaveCategories] = useState(false)
    const [editEmail, setEditEmail] = useState(false)
    const [emailTemplate, setEmailTemplate] = useState({
        title: "",
        body: ""
    })

    const [popupOpen, setPopupOpen] = useState(false)

    function handleAddProperty() { setPopupOpen(true) }
    function handleClose() { setPopupOpen(false) }

    function saveEmail() {
        const { title, body } = emailTemplate
        f7.store.dispatch('updateOne', { collectionName: 'settings', id: 'emailTemplate', payload: { title, body } })
        setEditEmail(false)
    }

    function handlePropertyChange({ id, name, address }) {
        let update = editedProperties
        update.map((property, index) => {
            if (property.id === id) {
                if (name) { update[index].name = name }
                if (address) { update[index].address = address }
            }
        })
        setEditedProperties(prev => ([...update]))
    }
    function handleSaveProperties() {
        console.log({ editedProperties })
        const initialProperties = properties.map(item => ({ id: item.docId, name: item.name }))
        if (!_.isEqual(initialProperties, editedProperties)) {
            console.log("saving")
            let update = editedProperties.map(property => ({
                id: property.id,
                name: property.name
            }))
            f7.store.dispatch('updateMany', { collectionName: 'properties', update })
        }
        setEditProperties(false)
    }
    function handleChannelEdit({ name, index }) {
        let temp = editedChannels
        editedChannels[index] = name
        setEditedChannels([...temp])
    }
    function handleSaveChannels() {
        f7.store.dispatch('updateOne', { collectionName: 'settings', id: 'channels', payload: { values: editedChannels } })
        setEditChannels(false)
        setCanSaveChannels(false)
    }
    function handleCategoryEdit({ name, index }) {
        let temp = editedCategories
        editedCategories[index] = name
        setEditedCategories([...temp])
    }
    function handleSaveCategories() {
        f7.store.dispatch('updateOne', { collectionName: 'settings', id: 'expenseCategories', payload: { values: editedCategories } })
        setEditCategories(false)
        setCanSaveCategories(false)
    }

    useEffect(() => {
        // console.log({ editedChannels })
        setCanSaveChannels(
            editChannels &&
            editedChannels.every((channel, index) => channel.length > 3) &&
            !_.isEqual(editedChannels, settings.filter(item => item.docId === 'çhannels')[0])
        )
    }, [editedChannels])

    useEffect(() => {
        // console.log({ editedCategories })
        setCanSaveCategories(
            editCategories &&
            editedCategories.every(category => category.length > 3) &&
            !_.isEqual(editedCategories, settings.filter(item => item.docId === 'expenseCategories')[0])
        )
    }, [editedCategories])

    useEffect(() => {
        setEditedProperties([...properties.map(item => ({ id: item.docId, name: item.name }))])
    }, [properties])

    useEffect(() => {
        setEditedChannels(settings.filter(item => item.docId === 'channels')[0]?.values || [])
        setEditedCategories(settings.filter(item => item.docId === 'expenseCategories')[0]?.values || [])
        setEmailTemplate(settings.filter(item => item.docId === 'emailTemplate')[0] || { title: "", body: "" })
    }, [settings])

    const AddProperty = () => {
        const [canSave, setCanSave] = useState(false)
        const [property, setProperty] = useState({
            name: "",
            address: "",
            units: [],
            rooms: 1
        })
        function handleNewPropertySave() {

            f7.store.dispatch('createOne', { collectionName: 'properties', payload: { name: property.name, address: property.address, units: [] } })
                .then(ref => {
                    // console.log('property created: ', ref)
                    let promises = [...Array(property.rooms)].map(async (item, index) => {
                        let payload = {
                            name: `Room ${index + 1}`,
                            property: doc(db, 'properties/' + ref)
                        }
                        return await createOne('units', payload)
                    })
                    Promise.all(promises).then(res => {
                        // console.log('units created: ', { res })
                        const payload = { units: res.map(id => doc(db, 'units/' + id)) }
                        // console.log({ payload })
                        updateOne({ collectionName: 'properties', id: ref, payload })
                    })
                })
            handleClose()
        }

        useEffect(() => {
            if (property?.name?.length > 3) {
                setCanSave(true)
            }
        }, [property])

        return (
            <Page>
                <Navbar title="Add new property">
                    {canSave && <Button onClick={handleNewPropertySave}><Icon material='save' /></Button>}
                    <NavRight>
                        <Button onClick={handleClose}>
                            <Icon material="close"></Icon>
                        </Button>
                    </NavRight>
                </Navbar>
                <Block>
                    <List>
                        <ListInput name="propertyName" label="Property name" placeholder="Enter name" onChange={(e) => { setProperty({ ...property, name: e.target.value }) }}></ListInput>
                        <ListInput name="propertyAddress" label Property address placeholder='Enter address' onChange={(e) => { setProperty({ ...property, address: e.target.value }) }}></ListInput>
                        <ListItem label="# of rooms">
                            <small className="display-block">Number of rooms</small>
                            <Stepper name="propertyRooms" value={property.rooms} min={1} onStepperChange={(e) => { setProperty({ ...property, rooms: e }) }}></Stepper>
                        </ListItem>
                    </List>
                </Block>
            </Page>
        )
    }

    return (
        <Page>
            <Navbar title="Settings" />
            <Block>
                <form>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Properties</h3>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {editProperties && <Button onClick={handleSaveProperties}><Icon material="save" /></Button>}
                                {editProperties && <Button onClick={handleAddProperty}><Icon material="add" /></Button>}
                                {editProperties || <Button onClick={() => setEditProperties(true)}><Icon material="edit" /></Button>}
                            </div>
                        </ListItem>
                        {_.sortBy(editedProperties, item => item.name).map(item => (
                            <Row key={item.id}>

                                <ListInput className='col-30' name={item.name} readonly={!editProperties} style={{ listStyleType: 'none' }}
                                    floatingLabel
                                    label="Property name"
                                    defaultValue={item.name}
                                    onChange={(e) => handlePropertyChange({ id: item.id, name: e.target.value })}
                                />
                                <ListInput className='col-70' name={item.address} readonly={!editProperties} style={{ listStyleType: 'none' }}
                                    floatingLabel
                                    label="Property address"
                                    defaultValue={item.address}
                                    onChange={(e) => handlePropertyChange({ id: item.id, address: e.target.value })}
                                />
                            </Row>
                        ))}
                    </List>
                    {/* <List noHairlines mediaList>
                        {_.sortBy(editedProperties, item => item.name).map(item => (
                            <ListItem key={item.id} link={`/properties/${item.id}`} title={item.name} />
                        ))}
                    </List> */}
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Booking channels</h3>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {canSaveChannels && <Button onClick={() => handleSaveChannels()}><Icon material="save" /></Button>}
                                {editChannels && <Button onClick={() => setEditedChannels([...editedChannels, ''])}><Icon material="add" /></Button>}
                                {editChannels || <Button onClick={() => setEditChannels(true)}><Icon material="edit" /></Button>}
                            </div>
                        </ListItem>
                        {_.sortBy(editedChannels, item => item).map((channel, index) => <ListInput key={index} name={"channel." + index} onChange={(e) => handleChannelEdit({ name: e.target.value, index })} readonly={!editChannels} defaultValue={channel} />)}
                    </List>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Expense categories</h3>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {canSaveCategories && <Button onClick={() => handleSaveCategories()}><Icon material="save" /></Button>}
                                {editCategories && <Button onClick={() => setEditedCategories([...editedCategories, ''])}><Icon material="add" /></Button>}
                                {editCategories || <Button onClick={() => setEditCategories(true)}><Icon material="edit" /></Button>}
                            </div>
                        </ListItem>
                        {_.sortBy(editedCategories, item => item).map((category, index) => <ListInput key={index} name={"expenseCategory." + index} onChange={(e) => handleCategoryEdit({ name: e.target.value, index })} readonly={!editCategories} defaultValue={category} />)}
                    </List>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Contract email template</h3>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {editEmail && <Button onClick={() => saveEmail()}><Icon material="save" /></Button>}
                                {editEmail || <Button onClick={() => setEditEmail(true)}><Icon material="edit" /></Button>}
                            </div>
                        </ListItem>
                        <ListInput floatingLabel label="Title" name="emailTitle" type='text' readonly={!editEmail} defaultValue={emailTemplate.title} onChange={(e) => setEmailTemplate({ ...emailTemplate, title: e.target.value })}></ListInput>
                        <ListInput floatingLabel label="Body" name="emailBody" type='textarea' readonly={!editEmail} defaultValue={emailTemplate.body} onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}></ListInput>
                    </List>
                </form>
            </Block>
            <Popup
                className="newProperty"
                opened={popupOpen}
                onPopupClosed={handleClose}
                onPopupSwipeClose={handleClose}
                onPopupClose={handleClose}
            >
                <AddProperty handleClose={handleClose} />
            </Popup>
        </Page>
    )
};

export default SettingsPage;
