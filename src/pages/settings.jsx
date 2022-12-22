import React, { useState, useEffect } from 'react';
import { Page, Navbar, Button, Block, List, ListItem, ListInput, Stepper, Icon, useStore, Popup, NavRight, f7 } from 'framework7-react';
import _, { initial } from 'lodash'
import store from '../js/store';
import { createOne, updateOne } from '../utils/firebase';
import { doc } from 'firebase/firestore'
import { db } from '../utils/firebase'

const SettingsPage = () => {
    const settings = useStore('settings');
    const properties = useStore('properties');
    // debugger;
    const [editProperties, setEditProperties] = useState(false)
    const initialProperties = [...Object.keys(properties).map(key => ({ id: key, name: properties[key].name }))]
    const [editedProperties, setEditedProperties] = useState(initialProperties)
    const [editChannels, setEditChannels] = useState(false)
    const [editedChannels, setEditedChannels] = useState(settings.channels.values)
    const [canSaveChannels, setCanSaveChannels] = useState(false)
    const [editedCategories, setEditedCategories] = useState(settings.expenseCategories.values)
    const [editCategories, setEditCategories] = useState(false)
    const [canSaveCategories, setCanSaveCategories] = useState(false)
    const [popupOpen, setPopupOpen] = useState(false)

    function handleAddProperty() { setPopupOpen(true) }
    function handleClose() { setPopupOpen(false) }

    function handlePropertyChange({ id, name }) {
        // console.log({ id, name })
        let update = editedProperties
        update.map((property, index) => {
            if (property.id === id) {
                update[index].name = name
            }
        })
        // console.log({ update })
        setEditedProperties(prev => ([...update]))
    }
    function handleSaveProperties() {
        console.log({ initialProperties, editedProperties })
        if (!_.isEqual(initialProperties, editedProperties)) {
            // console.log("saving")
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
            !editedChannels.every((channel, index) => channel === settings.channels[index])
        )
    }, [editedChannels])

    useEffect(() => {
        // console.log({ editedCategories })
        setCanSaveCategories(
            editCategories &&
            editedCategories.every(category => category.length > 3) &&
            !editedCategories.every((category, index) => category === settings.expenseCategories[index])
        )
    }, [editedCategories])

    useEffect(() => {
        setEditedProperties([...Object.keys(properties).map(key => ({ id: key, name: properties[key].name }))])
    }, [properties])

    const AddProperty = () => {
        const [canSave, setCanSave] = useState(false)
        const [property, setProperty] = useState({
            name: "",
            units: [],
            rooms: 1
        })
        function handleNewPropertySave() {

            f7.store.dispatch('createOne', { collectionName: 'properties', payload: { name: property.name, units: [] } })
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
                        {editedProperties.map(prop => (
                            <ListInput key={prop.id} name={prop.name} readonly={!editProperties}
                                defaultValue={prop.name}
                                onChange={(e) => handlePropertyChange({ id: prop.id, name: e.target.value })}
                            >
                            </ListInput>
                        ))}

                    </List>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Booking channels</h3>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {canSaveChannels && <Button onClick={() => handleSaveChannels()}><Icon material="save" /></Button>}
                                {editChannels && <Button onClick={() => setEditedChannels([...editedChannels, ''])}><Icon material="add" /></Button>}
                                {editChannels || <Button onClick={() => setEditChannels(true)}><Icon material="edit" /></Button>}
                            </div>
                        </ListItem>
                        {editedChannels.map((channel, index) => <ListInput key={index} name={"channel." + index} onChange={(e) => handleChannelEdit({ name: e.target.value, index })} readonly={!editChannels} defaultValue={channel} />)}
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
                        {editedCategories.map((category, index) => <ListInput key={index} name={"expenseCategory." + index} onChange={(e) => handleCategoryEdit({ name: e.target.value, index })} readonly={!editCategories} defaultValue={category} />)}
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
