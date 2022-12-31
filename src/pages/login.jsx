import React, { useEffect } from 'react';
import { Page, View, Block, Button, f7, List, LoginScreen, useStore } from 'framework7-react';
import { auth, signInWithGoogle } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import googleLogo from '../assets/google-logo.png'
import { id } from 'framework7/shared/utils';

const LoginPage = () => {

    const [user, loading, error] = useAuthState(auth);
    const tenantId = useStore('tenantId')

    useEffect(() => {


        // debugger;
        if (loading) {
            // maybe trigger a loading screen
            return;
        }
        // console.log({ user })
        if (!!user) {
            f7.loginScreen.close('#authScreen')
            store.dispatch('getContractTemplates');
        } else if (tenantId) {
            f7.loginScreen.open('#tenantFormScreen')
        } else {
            f7.loginScreen.open('#authScreen')
        }
    }, [user, loading])

    return (
        <LoginScreen
            id="authScreen"
            opened={user}
        >
            <View>
                <Page>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Block style={{ alignSelf: 'center', maxWidth: 400, minWidth: 300 }}>
                            <List noHairlines style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Button round raised onClick={() => signInWithGoogle()}>
                                    <img src={googleLogo} width={16} style={{ marginRight: 4 }} />
                                    Continue with Google
                                </Button>
                            </List>
                        </Block>
                    </div>
                </Page>
            </View>
        </LoginScreen>
    )
};

export default LoginPage;
