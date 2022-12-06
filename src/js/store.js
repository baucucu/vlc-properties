
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
    bookings:[],
    selected:[]
  },
  getters: {
    properties({state}) {
      return state.properties
    },
    selected({state}){
      return state.selected
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
    getProperties({ state,dispatch }) {
      f7.preloader.show()
      base("Properties").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.properties = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
          dispatch('getUnits')
      })
    },
    setSelected({state}, options){
      state.selected = options
    },
    getSelected({state}){
      state.selected = state.properties.map(property => property.id)
    },
    getUnits({ state,dispatch }) {
      f7.preloader.show()
      base("Units").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.units = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
          dispatch('getTenants')
      })
    },
    getTenants({ state,dispatch }) {
      f7.preloader.show()
      base("Tenants").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.tenants = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
          dispatch('getExpenses')
      })
    },
    getExpenses({ state,dispatch }) {
      f7.preloader.show()
      base("Expenses").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.expenses = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
          dispatch('getRevenue')
      })
    },
    getRevenue({ state,dispatch }) {
      f7.preloader.show()
      base("Revenue").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.revenue = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
          dispatch('getBookings')
      })
    },
    getBookings({ state,dispatch }) {
      f7.preloader.show()
      base("Bookings").select({
        view: "Grid view",
      }).firstPage((err, records) =>{
          state.bookings = records.map(record => {return ({id:record.id, ...record.fields})})
          f7.preloader.hide()
          dispatch('getSelected')
      })
    }
  },
})
export default store;
