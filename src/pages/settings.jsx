import React from 'react';
import { Page, Navbar, Block, List, ListItem, ListInput, ListButton, Icon, useStore } from 'framework7-react';
import { property } from 'lodash';

const SettingsPage = () => {
    const settings = useStore('settings');
    const properties = useStore('properties');
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
                                <ListButton small raised fill><Icon material="save" /></ListButton>
                                <ListButton small raised fill><Icon material="edit" /></ListButton>
                                <ListButton small raised fill><Icon material="add" /></ListButton>
                            </div>
                        </ListItem>
                        {properties.map((item, index) => (
                            <ListInput key={item.id} name={"property." + index} defaultValue={item.Name} >
                            </ListInput>
                        ))}
                    </List>
                </form>
                <form>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Booking channels</h3>
                            <div inset style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                <ListButton small raised fill><Icon material="save" /></ListButton>
                                <ListButton small raised fill><Icon material="edit" /></ListButton>
                                <ListButton small raised fill><Icon material="add" /></ListButton>
                            </div>
                        </ListItem>
                        {settings.channels.map((item, index) => <ListInput key={item} name={"channel." + index} defaultValue={item} />)}
                    </List>
                </form>
                <form>
                    <List noHairlines>
                        <ListItem >
                            <h3 slot="header">Expense categories</h3>
                            <div inset style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                                <ListButton small raised fill><Icon material="save" /></ListButton>
                                <ListButton small raised fill><Icon material="edit" /></ListButton>
                                <ListButton small raised fill><Icon material="add" /></ListButton>
                            </div>
                        </ListItem>
                        {settings.expenseCategories.map((item, index) => <ListInput key={item} name={"expenseCategory." + index} defaultValue={item} />)}
                    </List>
                </form>
            </Block>
        </Page>
    )
};

export default SettingsPage;
