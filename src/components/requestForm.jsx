import React, { useState, useEffect } from 'react';
import { Page, LoginScreen, Block, List, ListItem, useStore, Row, Col, ListInput, Icon, Button, f7, NavRight, Popup, Navbar } from 'framework7-react';
import useFirestoreListener from 'react-firestore-listener';
export default function RequestForm({ requestPopupOpen, handleRequestPopupClose, tenant }) {


    function handleSend() {
        let data = f7.form.convertToData('#requestForm')
        console.log({ data })
        f7.store.dispatch('sendEmail', { title: data.title, body: data.body, to: tenant.email }).then(res => {
            handleRequestPopupClose()
        })
    }

    return (
        <Popup
            opened={requestPopupOpen}
        >
            <Page>
                <Navbar title="Send email to tenant">
                    <NavRight>
                        <Button onClick={handleRequestPopupClose}>
                            <Icon material="close"></Icon>
                        </Button>
                    </NavRight>
                </Navbar>
                <Block>
                    <form id="requestForm" className="form-store-data infinite-scroll-content">
                        <List noHairlines>
                            <ListInput label="Title" type="text" name="title" defaultValue="Request for information" />
                            <ListInput label="Email" type="textarea" name="body" resizable
                                defaultValue={`Hi ${tenant.name},\n\nThanks for booking with us. We need some details to prepare your contract.\nPlease fill in the form from the link and upload a copy of your ID/Passport: https://vlc-properties-tenants.vercel.app/?tenantId=${tenant.docId}\n\nRegards,\nSteve\nVLC Property Management`}
                            />
                            <Button fill raised onClick={() => handleSend()}>Send</Button>
                        </List>
                    </form>
                </Block>
            </Page>
        </Popup>
    )
}
