import React, { useState, useEffect } from 'react';
import { Page, Popup, Block, List, ListInput, Icon, Button, f7, NavRight, Navbar } from 'framework7-react';
import useFirestoreListener from 'react-firestore-listener';

export default function ContractEmailForm({ contractPopupOpen, handleContractPopupClose, booking, contract, property, unit, tenant }) {



    function handleSend() {
        let data = f7.form.convertToData('#contractForm')
        console.log({ data })
        f7.store.dispatch('sendEmail', { title: data.title, body: data.body, to: tenant.email }).then(res => {
            handleContractPopupClose()
        })
    }

    useEffect(() => {
        console.log({ tenant, property, unit })
    }, [tenant, property, unit])

    return (
        <Popup
            opened={contractPopupOpen}
        >
            <Page>
                <Navbar title="Send contract to tenant">
                    <NavRight>
                        <Button onClick={handleContractPopupClose}>
                            <Icon material="close"></Icon>
                        </Button>
                    </NavRight>
                </Navbar>
                <Block>
                    <form id="contractForm" className="form-store-data">
                        <List noHairlines>
                            <ListInput label="Title" type="text" name="title" value={`Rental contract for ${property.name} ${unit.name}`} />
                            <ListInput label="Email" type="textarea" name="body" resizable
                                value={`Hi ${tenant.name},\n\nHere is the contract download link: https://docs.google.com/document/d/${contract.id}/export?format=pdf \n\nRegards,\nSteve\nVLC Property Management`}
                            />
                            <Button fill raised onClick={() => handleSend()}>Send</Button>
                        </List>
                    </form>
                </Block>
            </Page>
        </Popup>
    )
}