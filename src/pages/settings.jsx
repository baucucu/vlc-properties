import React, { useState, useEffect } from 'react';
import { Page, Navbar, Button, Block, List, ListItem, ListInput, Stepper, ListButton, Icon, useStore, Input, Popup, NavRight, f7 } from 'framework7-react';

const SettingsPage = () => {
    const settings = useStore('settings');
    const properties = useStore('properties');
    const [editProperties, setEditProperties] = useState(false)
    const initialProperties = properties.reduce((acc, property) => {
        return { ...acc, [property.id]: property.Name }
    }, {})
    const [editedProperties, setEditedProperties] = useState(initialProperties)
    const [editChannels, setEditChannels] = useState(false)
    const [editedChannels, setEditedChannels] = useState(settings.channels.values)
    const [canSaveChannels, setCanSaveChannels] = useState(false)
    const [nOfChannels, setNofChannels] = useState(editedChannels.length)
    const [editedCategories, setEditedCategories] = useState(settings.expenseCategories.values)
    const [editCategories, setEditCategories] = useState(false)
    const [canSaveCategories, setCanSaveCategories] = useState(false)
    const [nOfCategories, setNofCategories] = useState(editedCategories.length)
    const [popupOpen, setPopupOpen] = useState(false)

    function handleAddProperty() { setPopupOpen(true) }
    function handleClose() { setPopupOpen(false) }
    function handleSaveProperties() {
        // console.log(JSON.stringify(editedProperties))
        // console.log(JSON.stringify(initialProperties))
        if (JSON.stringify(editedProperties) !== JSON.stringify(initialProperties)) {
            // console.log('saving properties')
            f7.store.dispatch('saveProperties', editedProperties)
        }
        setEditProperties(false)
    }

    function handleAddChannel() {
        setNofChannels(nOfChannels + 1)
    }
    function handleChannelEdit({ name, index }) {
        let temp = editedChannels
        editedChannels[index] = name
        setEditedChannels([...temp])
    }
    function handleSaveChannels() {
        f7.store.dispatch('saveSettings', { id: settings.channels.id, values: editedChannels })
        setEditChannels(false)
        setCanSaveChannels(false)
    }

    function handleAddCategory() {
        setNofCategories(nOfCategories + 1)
    }
    function handleCategoryEdit({ name, index }) {
        let temp = editedCategories
        editedCategories[index] = name
        setEditedCategories([...temp])
    }
    function handleSaveCategories() {
        f7.store.dispatch('saveSettings', { id: settings.expenseCategories.id, values: editedCategories })
        setEditCategories(false)
        setCanSaveCategories(false)
    }

    useEffect(() => {
        setCanSaveChannels(
            editedChannels.every(item => item.length > 3) &&
            editedChannels !== settings.channels.values
        )
    }, [editedChannels])

    useEffect(() => {
        setCanSaveCategories(
            editedCategories.every(item => item?.length > 3) &&
            editedCategories !== settings.expenseCategories.values
        )
    }, [editedCategories])

    const AddProperty = () => {
        const [canSave, setCanSave] = useState(false)
        const [property, setProperty] = useState({
            name: "",
            rooms: 1
        })
        function handleNewPropertySave() {
            f7.store.dispatch('addProperty', property)
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
                        {properties.map((item, index) => (
                            <ListInput key={item.id} name={item.id} readonly={!editProperties} onChange={(e) => setEditedProperties({ ...editedProperties, [item.id]: e.target.value })} defaultValue={item.Name} >
                            </ListInput>
                        ))}

                    </List>
                </form>
                <form>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Booking channels</h3>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {canSaveChannels && <Button onClick={() => handleSaveChannels()}><Icon material="save" /></Button>}
                                {editChannels && <Button onClick={() => handleAddChannel()}><Icon material="add" /></Button>}
                                {editChannels || <Button onClick={() => setEditChannels(true)}><Icon material="edit" /></Button>}
                            </div>
                        </ListItem>
                        {[...Array(nOfChannels).keys()].map((index) => <ListInput key={index} name={"channel." + index} onChange={(e) => handleChannelEdit({ name: e.target.value, index })} readonly={!editChannels} defaultValue={editedChannels[index]} />)}
                    </List>
                </form>
                <form>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Expense categories</h3>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {canSaveCategories && <Button onClick={() => handleSaveCategories()}><Icon material="save" /></Button>}
                                {editCategories && <Button onClick={() => handleAddCategory()}><Icon material="add" /></Button>}
                                {editCategories || <Button onClick={() => setEditCategories(true)}><Icon material="edit" /></Button>}
                            </div>
                        </ListItem>
                        {[...Array(nOfCategories).keys()].map((index) => <ListInput key={index} name={"expenseCategory." + index} onChange={(e) => handleCategoryEdit({ name: e.target.value, index })} readonly={!editCategories} defaultValue={editedCategories[index]} />)}
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
