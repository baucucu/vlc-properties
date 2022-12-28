import store from '../js/store'
import axios from 'axios';
import { auth } from './firebase'

export default async function () {
    console.log({ auth: auth.currentUser.accessToken })
    let token = await auth.currentUser.getIdToken()
    console.log({ token })
    axios.get(`https://www.googleapis.com/drive/v3/files?q=mimeType%3D%22application%2Fvnd.google-apps.folder%22`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => {
        console.log({ files: res.data.files })
        store.dispatch('setFolders', res.data.files)
    }).then(err => {
        console.log(err)
    })
}