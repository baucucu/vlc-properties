
import { createStore } from 'framework7/lite';
import {f7} from 'framework7-react'
import { getRecords, updateRecords } from '../utils/airtable';

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
   async getProperties({ state,dispatch }) {
      f7.preloader.show()
      state.properties = await getRecords('Properties')
      f7.preloader.hide()
      dispatch('getUnits')
    },
    async getUnits({ state,dispatch }) {
      f7.preloader.show()
      state.units = await getRecords('Units')
      f7.preloader.hide()
      dispatch('getTenants')
    },
    async getTenants({ state,dispatch }) {
      f7.preloader.show()
      state.tenants = await getRecords('Tenants')
      f7.preloader.hide()
      dispatch('getExpenses')
    },
    async saveTenant({state, dispatch},data){
      f7.preloader.show()
      let payload = {
        records: [
          {
            id: data.recordId,
            fields: {
              "Name": data.name,
              "Phone":data.phone,
              "Email":data.email,
              "Permanent address": data.address,
              "Passport / ID number": data.idNumber,
              "Notes": data.notes
            }
          }
        ]
      }
      console.log({payload})
      await updateRecords('Tenants',payload)
      f7.preloader.show()
      dispatch('getTenants')
    },
    async getExpenses({ state,dispatch }) {
      f7.preloader.show()
      try{
        state.expenses = await getRecords('Expenses')
      } catch(e){console.log({e})}
      
      f7.preloader.hide()
      dispatch('getRevenue')
    },
    async saveExpenses({state,dispatch},data){
      console.log("expenses received: ",{data})
    },
    async getRevenue({ state,dispatch }) {
      f7.preloader.show()
      state.revenue = await getRecords('Revenue')
      f7.preloader.hide()
      dispatch('getBookings')
    },
    async getBookings({ state,dispatch }) {
      f7.preloader.show()
      state.bookings = await getRecords('Bookings')
      f7.preloader.hide()
      dispatch('getSelected')
    },
    setSelected({state}, options){
      state.selected = options
    },
    getSelected({state}){
      state.selected = state.properties.map(property => property.id)
    },
  },
})
export default store;
