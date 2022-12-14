
import { createStore } from 'framework7/lite';
import {f7} from 'framework7-react'
import { getRecords, updateRecords, createRecords } from '../utils/airtable';
import currency from 'currency.js';

const store = createStore({
  state: {
    properties: [],
    units: [],
    tennants:[],
    expenses:[],
    revenue:[],
    bookings:[],
    selected:[],
    booking: undefined
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
    },
    booking({state}) {
      return state.booking
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
    async addTenant({state, dispatch},data){
      f7.preloader.show()
      let payload = {
        records: [
          {
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
      await createRecords('Tenants',payload)
      f7.preloader.show()
      dispatch('getTenants')
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
      f7.preloader.show()
      console.log("expenses received: ",{data})
      let records = Array(data.formData.length/5).fill({
        fields:{
          Amount: null,
          Expense: null,
          Date: null,
          Property: null,
          Category: null
        }
      })
      data.formData.forEach(item => {
        if(!records[item.index]){
          records[item.index] = {}
        }
        switch(item.property){
          case 'amount':
            records[item.index].fields.Amount = Number(item.value)
          case 'date':
            records[item.index].fields.Date = item.value
          case 'property':
            records[item.index].fields.Property = [item.value]
          case 'category':
            records[item.index].fields.Category = item.value  
          case 'description':
            records[item.index].fields.Expense = item.value
          default:
            return;
        }
      })
      console.log({records})
      await createRecords('Expenses',{records})
      .then(() => {
        f7.preloader.hide()
        dispatch('getExpenses')
      })
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
    async getBooking({state, dispatch},id) {
      console.log("getBooking",{id})
      f7.preloader.show()
      state.booking = state.bookings.filter(booking => booking.id === id)[0]
      f7.preloader.hide()
    },
    async addBooking({state,dispatch},data){
      let formData = f7.form.getFormData('#addNewBooking')
      console.log({formData})
      console.log({received: data})
      f7.preloader.show()
      let payload = {
        records:[{
          fields: {
            "Check in": data.checkIn,
            "Check out": data.checkOut,
            "Tenant": [data.tenant],
            "Unit": [data.unit],
            "Rent": currency(data.rent),
            "Deposit": currency(data.deposit),
            "Channel": data.channel,
            "Type": data.type,
            "Notes": data.notes
          }
        }]
      }
      console.log({payload})
      const newBooking = await createRecords('Bookings',payload)
      console.log({newBooking})
      f7.preloader.show()
      dispatch('getBookings')
    },
    async saveBooking({state,dispatch},data) {
      let formData = f7.form.getFormData('#bookingForm')
      console.log({formData})
      console.log({received:data})
      f7.preloader.show()
      let payload = {
        records: [
          {
            id: data.recordId,
            fields: {
              "Status": data.status,
              "Type": data.type,
              "Tenant": [data.tenant],
              "Unit": [data.unit],
              "Notes": data.notes,
              "Channel": data.channel,
              "Rent": currency(data.rent)/100,
              "Deposit": currency(data.deposit)/100,
              "Check in": data.checkIn,
              "Check out": data.checkOut, 
            }
          }
        ]
      }
      console.log({payload})
      const update = await updateRecords('Bookings',payload)
      console.log({update})
      f7.preloader.show()
      dispatch('getBookings')
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
