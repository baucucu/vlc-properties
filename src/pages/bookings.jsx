import React, { useState, useEffect, useRef } from 'react'
import { f7, Page, Navbar, Block, List, ListItem, useStore, Chip, Badge, Button, Popup, NavRight, Icon, Row, Col, ListInput, ListButton } from 'framework7-react'
import { PickerInline } from 'filestack-react'
import useFirestoreListener from "react-firestore-listener"
import { doc, arrayUnion } from 'firebase/firestore'
import { db } from '../utils/firebase'
import _ from 'lodash'
import dayjs from 'dayjs'
import currency from 'currency.js'
import { Timestamp } from 'firebase/firestore'
import PropertyRoomSelector from '../components/PropertyRoomSelector'

const BookingsPage = () => {
  const settings = useFirestoreListener({ collection: "settings" })
  const properties = useFirestoreListener({ collection: "properties" })
  const tenants = useFirestoreListener({ collection: "tenants" })
  const units = useFirestoreListener({ collection: "units" })
  const bookings = useFirestoreListener({ collection: "bookings" })

  const [popupOpen, setPopupOpen] = useState(false)
  const [tenantPopupOpen, setTenantPopupOpen] = useState(false)

  function handleClose() {
    setPopupOpen(false)
  }
  function handletenantClose() {
    setTenantPopupOpen(false)
  }

  function AddBooking({ handleClose }) {
    const [readOnly, setReadOnly] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState()
    const [selectedUnit, setSelectedUnit] = useState()
    const [canSave, setCanSave] = useState(false)
    const [formData, setFormData] = useState({})

    async function handleSave() {

      let data = f7.form.convertToData('#newBookingForm')
      console.log({ data })
      let [d1, m1, y1] = data.checkIn.split('/')
      let date = new Date(y1, m1 - 1, d1).setHours(14, 0, 0, 0)
      const checkIn = Timestamp.fromMillis(date)
      console.log({ date, checkIn })
      const [d2, m2, y2] = data.checkOut.split('/')
      date = new Date(y2, m2 - 1, d2).setHours(8, 0, 0, 0)
      const checkOut = Timestamp.fromMillis(date)
      console.log({ date, checkOut })
      const rent = Number(currency(data.rent, { symbol: '???', decimal: ',', separator: '.' }).value)
      const yearlyRent = Number(currency(data.yearlyRent, { symbol: '???', decimal: ',', separator: '.' }).value)
      const amount = Number(currency(data.amount, { symbol: '???', decimal: ',', separator: '.' }).value)
      const deposit = Number(currency(data.deposit, { symbol: '???', decimal: ',', separator: '.' }).value)
      console.log({ rent, yearlyRent, amount, deposit })
      let payload = {
        channel: data.channel,
        amount,
        type: data.type,
        rent,
        deposit,
        yearlyRent,
        notes: data.notes,
        date: new Date(),
        checkIn,
        checkOut,
        tenant: doc(db, 'tenants', data.tenant),
        unit: doc(db, 'units', formData.unit),
        property: doc(db, 'properties', formData.property)
      }
      console.log({ payload })
      f7.store.dispatch('createOne', { collectionName: 'bookings', payload }).then(ref => {
        payload = {
          bookings: arrayUnion(ref)
        }
        f7.store.dispatch('updateOne', { collectionName: 'tenants', id: data.tenant, payload })
        // f7.store.dispatch('createContract', { booking: ref })
      })
      // let increment = dayjs(formData.checkOut).diff(dayjs(formData.checkIn), 'day') < 30 ? 'day' : 'month'
      // let day = formData.checkIn
      // do {
      //   payload = {
      //     tenant: doc(db, 'tenants', formData.tenant),
      //     unit: doc(db, 'units', formData.unit),
      //     property: doc(db, 'properties', formData.property),
      //     amount: Number(formData.rent),
      //     date: new Date(day)
      //   }
      //   f7.store.dispatch('createOne', { collectionName: 'revenue', payload })
      //   day = dayjs(day).add(1, increment)
      // } while (dayjs(day).isBefore(dayjs(formData.checkOut)))

      handleClose()
    }

    function handleChange(property, value) {
      // let data = f7.form.convertToData('#newBookingForm')
      // console.log({ data })
      setFormData({ ...formData, [property]: value })
    }

    useEffect(() => {
      setFormData({ ...formData, property: selectedProperty, unit: selectedUnit })
    }, [selectedProperty, selectedUnit])

    useEffect(() => {
      console.log("formData changed: ", { formData })
      let emptyFields = Object.keys(formData).filter(key => formData[key] === '' && key !== 'notes')
      console.log({ emptyFields })
      if (Object.keys(formData).length > 0 && emptyFields.length === 0) { setCanSave(true) } else { setCanSave(false) }
    }, [formData])

    return (
      <Page>
        <Navbar title="Add new booking">
          {canSave && <Button onClick={handleSave}><Icon material='save' /></Button>}
          <NavRight>
            <Button onClick={handleClose}>
              <Icon material="close"></Icon>
            </Button>
          </NavRight>
        </Navbar>
        <Block>
          <form id="newBookingForm" className="form-store-data">
            <Row>
              <Col small>
                <List noHairlines style={{ marginTop: 0 }}>
                  <ListInput name="tenant" label="Tenant" type='select' onChange={(e) => handleChange({ property: 'tenant', value: e.target.value })} disabled={readOnly} defaultValue="">
                    <option value="" disabled>--Select--</option>
                    {_.sortBy(tenants, item => item.name).map(tenant => (<option key={tenant.docId} value={tenant.docId}>{tenant.name}</option>))}
                  </ListInput>
                  <ListButton onClick={() => { setTenantPopupOpen(true) }}>Add new tenant</ListButton>
                </List>
              </Col>
              <Col>
                <PropertyRoomSelector properties={properties} units={units} setSelectedProperty={setSelectedProperty} setSelectedUnit={setSelectedUnit} />
              </Col>
            </Row>
            <Row>
              <Col>
                <List noHairlines style={{ marginTop: 0 }}>
                  <ListInput name="type" type="select" label="Booking type" onChange={(e) => setFormData({ ...formData, type: e.target.value })} disabled={readOnly} defaultValue="">
                    <option value="" disabled>--Select--</option>
                    <option value="Short term">Short term</option>
                    <option value="Long term">Long term</option>
                  </ListInput>
                </List>
              </Col>
              <Col>
                <List noHairlines style={{ marginTop: 0 }}>
                  <ListInput name='channel' type="select" label="Channel" onChange={(e) => handleChange({ property: 'channel', value: e.target.value })} disabled={readOnly} defaultValue="">
                    <option value="" disabled>--Select--</option>
                    {_.sortBy(settings.filter(item => item.docId === 'channels')[0]?.values, item => item)
                      .map(item => (<option key={item} value={item}>{item}</option>))}
                  </ListInput>
                </List>
              </Col>
            </Row>
            <Row>
              <Col>
                <List noHairlines>
                  <ListInput
                    name="checkIn"
                    label="Check in"
                    type='datepicker'
                    calendarParams={{
                      minDate: dayjs(),
                      locale: "en",
                      dateFormat: 'dd/mm/yyyy'
                    }}
                    disabled={readOnly}
                    onCalendarChange={(value) => {
                      setFormData(formdata => ({ ...formdata, checkIn: value }))
                    }}
                  />
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput
                    name="checkOut"
                    label="Check out"
                    type='datepicker'
                    calendarParams={{
                      minDate: dayjs(),
                      locale: "en",
                      dateFormat: 'dd/mm/yyyy'
                    }}
                    disabled={readOnly}
                    onCalendarChange={(value) => {
                      setFormData(formdata => ({ ...formdata, checkOut: value }))
                    }}
                  />
                </List>
              </Col>
            </Row>
            <Row>
              <Col small>
                <List noHairlines>
                  <ListInput name="rent" type="number" label="Monthly rent" defaultValue={0} onChange={(e) => handleChange({ property: 'rent', value: e.target.value })} disabled={readOnly} />
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="yearlyRent" type="number" label="Yearly rent" defaultValue={0} onChange={(e) => handleChange({ property: 'yearlyRent', value: e.target.value })} disabled={readOnly} />
                </List>
              </Col>
            </Row>
            <Row>
              <Col small>
                <List noHairlines>
                  <ListInput name="deposit" type="number" label="Deposit" defaultValue={0} onChange={(e) => handleChange({ property: 'deposit', value: e.target.value })} disabled={readOnly} />
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="amount" type="number" label="Total amount" defaultValue={0} onChange={(e) => handleChange({ property: 'amount', value: e.target.value })} disabled={readOnly} />
                </List>
              </Col>
            </Row>
            <List noHairlines>
              <ListItem >
                <h3 slot="header">Notes</h3>
              </ListItem>
              <ListInput
                name="notes"
                type="textarea"
                resizable
                placeholder="Enter notes here"
                disabled={readOnly}
                onChange={(e) => handleChange({ property: 'notes', value: e.target.value })}
              >
                <Icon material="notes" slot="media" />
              </ListInput>

            </List>
          </form>
        </Block>

      </Page>

    )
  }

  function AddTenant({ handletenantClose }) {
    const [canSave, setCanSave] = useState(false)
    const [formData, setFormData] = useState({})
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploads, setUploads] = useState([])

    function handleSave() {
      let payload = {
        ...formData,
        uploads
      }
      f7.store.dispatch('createOne', { collectionName: 'tenants', payload })
      handletenantClose()
    }
    function handleChange() {
      let data = f7.form.convertToData('#newBookingtenantForm')
      setFormData(data)
    }
    useEffect(() => {
      let emptyFields = Object.keys(formData).filter(key => formData[key] === '' && key !== 'notes')
      if (emptyFields.length === 0) { setCanSave(true) } else { setCanSave(false) }
    }, [formData])

    return (
      <Page>
        <Navbar title="Add new tenant">
          {canSave && <Button onClick={handleSave}><Icon material='save' /></Button>}
          <NavRight>
            <Button onClick={handletenantClose}>
              <Icon material="close"></Icon>
            </Button>
          </NavRight>
        </Navbar>
        <form id="newBookingtenantForm" className="form-store-data">
          <Block>
            <Row>
              <List noHairlines className='col'>
                <ListInput name="name" label="Name" onChange={(e) => handleChange({ property: 'tenant', value: e.target.value })} />
                <ListInput name="email" label="Email" onChange={(e) => handleChange({ property: 'tenant', value: e.target.value })} />
                <ListInput name="phone" label="Phone" onChange={(e) => handleChange({ property: 'tenant', value: e.target.value })} />
              </List>

              <List noHairlines className='col'>
                <ListInput name="country" label="Country" onChange={(e) => handleChange({ property: 'tenant', value: e.target.value })} />
                <ListInput
                  name="idNumber"
                  label="ID number"
                  onChange={(e) => handleChange({ property: 'tenant', value: e.target.value })}
                />

              </List>
            </Row>
            <List noHairlines>
              <ListInput name="address" label="Permanent address" onChange={(e) => handleChange({ property: 'tenant', value: e.target.value })} />
            </List>
            <List noHairlines>
              <ListItem >
                <h2 slot="header">Files</h2>
              </ListItem>
              {uploads.map(file => <ListItem key={file.handle} mediaItem title={file.filename}>
                {file.url ? <img src={file.url} width={40} slot="media" /> : <Icon material="file" />}
              </ListItem>)}
            </List>
            <Button onClick={() => setPickerOpen(true)}>Add files</Button>
            {pickerOpen && <PickerInline
              apikey={import.meta.env.VITE_FILESTACK_KEY}
              pickerOptions={{}}
              onUploadDone={(res) => {
                setUploads([...uploads, ...res.filesUploaded])
                setPickerOpen(false)
              }}
            />}
            <List noHairlines>
              <ListItem >
                <h3 slot="header">Notes</h3>
              </ListItem>
              <ListInput
                name="notes"
                type="textarea"
                resizable
                placeholder="Enter notes here"
                onChange={(e) => handleChange({ property: 'tenant', value: e.target.value })}
              >
                <Icon material="notes" slot="media" />
              </ListInput>
            </List>
          </Block>
        </form>
      </Page>
    )
  }

  return (
    <Page>
      <Navbar title="Bookings">
        <Button onClick={() => setPopupOpen(true)}>
          <Icon material='add'></Icon>
        </Button>
      </Navbar>
      <Block>
        <List mediaList>
          {
            _.sortBy(bookings, item => item.date).map(booking => {
              let tenant = tenants.filter(tenant => tenant.docId === booking.tenant.id)[0]
              let property = properties.filter(property => property.docId === booking.property.id)[0]
              let unit = units.filter(unit => unit.docId === booking.unit.id)[0]
              return (
                <ListItem
                  key={booking.docId}
                  link={`/bookings/${booking.docId}`}
                  title={
                    <div style={{ display: "flex", gap: 16 }}>

                      <Chip
                        text={tenant?.name}
                        mediaBgColor="black"
                        iconMaterial='person'
                        iconF7='person'
                        iconAurora='person'
                        iconIos='person'
                      >
                      </Chip>
                      <Chip
                        text={`${property.name} - ${unit.name}`}
                        mediaBgColor="black"
                        iconMaterial='business'
                        iconAurora='building'
                      >
                      </Chip>
                      <Chip
                        text={`${dayjs(booking.checkIn.toDate()).format("D MMM YY")} to ${dayjs(booking.checkOut.toDate()).format("D MMM YY")}`}
                        mediaBgColor="black"
                        iconMaterial='calendar'
                        iconF7='person'
                        iconAurora='person'
                        iconIos='person'
                      >
                      </Chip>

                    </div>
                  }
                  text={<><Badge color='black'>{booking.type}</Badge><Badge color="black">{booking.channel}</Badge></>}
                >
                </ListItem>
              )
            })
          }
        </List>
      </Block>
      <Popup
        className="addBooking"
        opened={popupOpen}
        onPopupClosed={handleClose}
        onPopupSwipeClose={handleClose}
        onPopupClose={handleClose}
      >
        <AddBooking handleClose={handleClose} />
      </Popup>
      <Popup
        className="newtenant"
        opened={tenantPopupOpen}
        onPopupClosed={handletenantClose}
        onPopupSwipeClose={handletenantClose}
        onPopupClose={handletenantClose}
      >
        <AddTenant handletenantClose={handletenantClose} />
      </Popup>
    </Page>
  );
}

export default BookingsPage;
