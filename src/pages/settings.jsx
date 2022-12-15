import React, { useState, useEffect } from 'react';
import { Page, Navbar, Button, Block, List, ListItem, ListInput, Stepper, ListButton, Icon, useStore, Input, Popup, NavRight, f7 } from 'framework7-react';

const SettingsPage = () => {
    const settings = useStore('settings');
    const properties = useStore('properties');
    const [editProperties, setEditProperties] = useState(false)
    const [editedProperties, setEditedProperties] = useState(properties.reduce((acc, property) => {
        return { ...acc, [property.id]: property.Name }
    }, {}))
    const [editChannels, setEditChannels] = useState(false)
    const [editCategories, setEditCategories] = useState(false)
    const [popupOpen, setPopupOpen] = useState(false)

    function handleAddProperty() { setPopupOpen(true) }
    function handleClose() { setPopupOpen(false) }
    function handleSaveProperties() {
        f7.store.dispatch('saveProperties', editedProperties)
    }
    useEffect(() => {
        console.log({ editedProperties })
    }, [editedProperties])

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
            console.log({ property })
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
                                {editChannels && <Button ><Icon material="save" /></Button>}
                                {editChannels && <Button ><Icon material="add" /></Button>}
                                {editChannels || <Button ><Icon material="edit" /></Button>}
                            </div>
                        </ListItem>
                        {settings.channels.map((item, index) => <ListInput key={item} name={"channel." + index} readonly={!editChannels} defaultValue={item} />)}
                    </List>
                </form>
                <form>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Expense categories</h3>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {editCategories && <Button ><Icon material="save" /></Button>}
                                {editCategories && <Button ><Icon material="add" /></Button>}
                                {editCategories || <Button ><Icon material="edit" /></Button>}
                            </div>
                        </ListItem>
                        {settings.expenseCategories.map((item, index) => <ListInput key={item} name={"expenseCategory." + index} readonly={!editCategories} defaultValue={item} />)}
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
