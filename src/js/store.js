
import { createStore } from 'framework7/lite';
import {
  getRecords,
  updateOne,
  createOne
} from '../utils/firebase'
import currency from 'currency.js';
import dayjs from 'dayjs';
import { f7 } from 'framework7-react';
import axios from 'axios';

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
    }
  },
  actions: {
    generateContract({ state, dispatch }, { payload }) {
      console.log({ payload })
      axios.post('https://eogu1ng0k7fa2z2.m.pipedream.net', { payload }).then(res => {
        console.log({ res })
      })
    },
    getContractTemplates({ state }) {
      axios.get('https://eo47m6860e33ebo.m.pipedream.net').then(res => {
        // console.log({ res })
        state.templates = res.data.files
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
        'settings'
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
