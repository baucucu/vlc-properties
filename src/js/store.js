
import { createStore } from 'framework7/lite';
import {f7} from 'framework7-react'
import base from '../utils/airtable';

const store = createStore({
  state: {
    properties: [],
    units: [],
    tennants:[],
    expenses:[],
    revenue:[],
    bookings:[]
  },
  getters: {
    properties({state}) {
      return state.properties
    },
    units({state}) {
      return state.units
    },
    tenants({state}) {
      return state.tenants
    },
    expenses({state}) {
      return state.expenses
    },
    revenue({state}) {
      return state.revenue
    },
    bookings({state}) {
      return state.bookings
    }
  },
  actions: {
    getProperties({ state }) {
      f7.preloader.show()
      base("Properties").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.properties = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
      })
    },
    getUnits({ state }) {
      f7.preloader.show()
      base("Units").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.units = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
      })
    },
    getTenants({ state }) {
      f7.preloader.show()
      base("Tenants").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.tenants = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
      })
    },
    getExpenses({ state }) {
      f7.preloader.show()
      base("Expenses").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.expenses = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
      })
    },
    getRevenue({ state }) {
      f7.preloader.show()
      base("Revenue").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.revenue = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
      })
    },
    getBookings({ state }) {
      f7.preloader.show()
      base("Bookings").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.bookings = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
      })
    }
  },
})
export default store;
