import React, { useState, useEffect } from 'react';
import { Page, Navbar, Block, List, ListItem, ListInput, Stepper, ListButton, Icon, useStore, Row, Col } from 'framework7-react';

const SettingsPage = () => {
    const settings = useStore('settings');
    const properties = useStore('properties');
    const [editProperties, setEditProperties] = useState(false)
    const [editChannels, setEditChannels] = useState(false)
    const [editCategories, setEditCategories] = useState(false)
    console.log({ properties })

    return (
        <Page>
            <Navbar title="Settings" />
            <Block>
                <form>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Properties</h3>
                            <div inset style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {editProperties && <ListButton ><Icon material="save" /></ListButton>}
                                {editProperties && <ListButton><Icon material="add" /></ListButton>}
                                {editProperties || <ListButton onClick={() => setEditProperties(true)}><Icon material="edit" /></ListButton>}
                            </div>
                        </ListItem>
                        {properties.map((item, index) => (
                            <ListInput key={item.id} name={"property." + index} readonly={editProperties} defaultValue={item.Name} >
                            </ListInput>
                        ))}

                    </List>
                </form>
                <form>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Booking channels</h3>
                            <div inset style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {editChannels && <ListButton small raised fill><Icon material="save" /></ListButton>}
                                {editChannels || <ListButton small raised fill><Icon material="edit" /></ListButton>}
                                <ListButton small raised fill><Icon material="add" /></ListButton>
                            </div>
                        </ListItem>
                        {settings.channels.map((item, index) => <ListInput key={item} name={"channel." + index} readonly={editChannels} defaultValue={item} />)}
                    </List>
                </form>
                <form>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Expense categories</h3>
                            <div inset style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                {editCategories && <ListButton small raised fill><Icon material="save" /></ListButton>}
                                {editCategories || <ListButton small raised fill><Icon material="edit" /></ListButton>}
                                <ListButton small raised fill><Icon material="add" /></ListButton>
                            </div>
                        </ListItem>
                        {settings.expenseCategories.map((item, index) => <ListInput key={item} name={"expenseCategory." + index} readonly={editCategories} defaultValue={item} />)}
                    </List>
                </form>
            </Block>
        </Page>
    )
};

export default SettingsPage;
