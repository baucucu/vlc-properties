
import { createStore } from 'framework7/lite';
import {
  getRecords,
  updateOne,
  createOne,
  deleteOne
} from '../utils/firebase'
import currency from 'currency.js';
import dayjs from 'dayjs';
import { f7 } from 'framework7-react';
import axios from 'axios';
import { arrayUnion } from 'firebase/firestore'

const store = createStore({
  state: {
    properties: {},
    units: {},
    tennants: {},
    expenses: {},
    revenue: {},
    bookings: {},
    selected: [],
    booking: undefined,
    settings: {},
    templates: [],
    tenantId: undefined,
  },
  getters: {
    templates: ({ state }) => {
      return state.templates
    },
    properties({ state }) {
      return state.properties
    },
    selected({ state }) {
      return state.selected
    },
    units({ state }) {
      return state.units
    },
    tennants({ state }) {
      return state.tennants
    },
    expenses({ state }) {
      return state.expenses
    },
    revenue({ state }) {
      return state.revenue
    },
    bookings({ state }) {
      return state.bookings
    },
    booking({ state }) {
      return state.booking
    },
    settings({ state }) {
      return state.settings
    },
    templates({ state }) {
      return state.templates
    },
    tenantId({ state }) {
      return state.tenantId
    }
  },
  actions: {
    async sendEmail({ state, dispatch }, { title, body, to }) {
      f7.preloader.show()
      return axios.post('https://eok3tdbn3q3vyva.m.pipedream.net', { title, body, to }).then(res => {
        console.log({ res })
        f7.preloader.hide()
        f7.dialog.alert('Email sent')
        return res
      })
    },
    async addUploads({ state, dispatch }, { tenantId, uploads }) {
      let promises = uploads.map(async file => {
        return await db.collection('tenants').doc(tenantId).collection('uploads').doc(file.uploadId).set(file)
      })
      return Promise.all(promises).then((res) => {
        return res
      })
    },
    async removeUpload({ state, dispatch }, { tenantId, fileId }) {
      return await db.collection('tenants').doc(tenantId).collection('uploads').doc(fileId).delete()
    },
    setTenantId({ state }, { tenantId }) {
      state.tenantId = tenantId
    },
    generateContract({ state, dispatch }, { payload }) {
      console.log({ payload })
      f7.preloader.show()
      axios.post('https://eogu1ng0k7fa2z2.m.pipedream.net', { payload }).then(res => {
        console.log({ res })
        updateOne({ collectionName: 'bookings', id: payload.bookingId, payload: { contracts: arrayUnion(res.data.file) } }).then(() => f7.preloader.hide())
      })
    },
    sendContract({ state, dispatch }, { payload }) {
      console.log({ payload })
      f7.preloader.show()
      axios.post('https://eo2zrkwk4y39fg3.m.pipedream.net', { payload }).then(res => {
        console.log({ res })
        updateOne({ collectionName: 'bookings', id: payload.bookingId, payload: { log: arrayUnion(res.data) } }).then(() => f7.preloader.hide())
      })
    },
    getContractTemplates({ state }) {
      if (state.templates.length > 0) return
      f7.preloader.show()
      axios.get('https://eo47m6860e33ebo.m.pipedream.net').then(res => {
        // console.log({ res })
        state.templates = res.data.files
        f7.preloader.hide()
      })
    },
    setProperties({ state, dispatch }, { properties }) {
      console.log({ received: properties })
    },
    getData({ state, dispatch }) {
      [
        'properties',
        'units',
        'bookings',
        'tennants',
        'expenses',
        'revenue',
        'settings',
      ].map(collectionName => {
        getRecords(collectionName)
      })
    },
    setData({ state, dispatch }, { collectionName, docs }) {
      // console.log({ received: { collectionName, docs } })
      docs.map(doc => state[collectionName] = { ...state[collectionName], [doc.id]: doc })
      if (collectionName === 'properties') { dispatch('getSelected') }
    },
    async updateOne({ state, dispatch }, { collectionName, id, payload }) {
      // console.log({ received: { collectionName, id, payload } })
      updateOne({ collectionName, id, payload })
    },
    updateMany({ state, dispatch }, { collectionName, update }) {
      // console.log({ received: { collectionName, update } })
      update.map(property => {
        updateOne({ collectionName, id: property.id, payload: { name: property.name } })
      })
    },
    async createOne({ state, dispatch }, { collectionName, payload }) {
      console.log({ received: { collectionName, payload } })
      return await createOne(collectionName, payload)
    },
    async deleteOne({ state, dispatch }, { collectionName, id }) {
      console.log({ received: { collectionName, id } })
      return await deleteOne(collectionName, id)
    },
    setSelected({ state }, options) {
      // console.log({ options })
      state.selected = options
    },
    getSelected({ state }) {
      // console.log(Object.keys(state.properties))
      state.selected = Object.keys(state.properties)
    },
  },
})
export default store;
