import React, { useEffect, useState } from 'react';
import {
  Page,
  Navbar,
  List,
  ListInput,
  ListItem,
  Row,
  Button,
  Block,
  Col,
  Icon,
  NavRight,
  f7
} from 'framework7-react';
import dayjs from 'dayjs'
import currency from 'currency.js';
import useFirestoreListener from "react-firestore-listener"
import { doc, arrayUnion } from 'firebase/firestore'
import { db } from '../utils/firebase'


const BookingPage = ({ f7route }) => {
  const settings = useFirestoreListener({ collection: "settings" })
  const tenants = useFirestoreListener({ collection: "tenants" })
  const properties = useFirestoreListener({ collection: "properties" })
  const bookings = useFirestoreListener({ collection: "bookings" })
  const units = useFirestoreListener({ collection: "units" })
  const [booking, setBooking] = useState()

  const [readOnly, setReadOnly] = useState(true)
  const [selectedTenant, setSelectedTenant] = useState()
  const [selectedProperty, setSelectedProperty] = useState()
  const [selectedUnit, setSelectedUnit] = useState()
  const [selectableUnits, setSelectableUnits] = useState([])

  useEffect(() => {
    console.log({ bookings })
    let temp = bookings.filter(item => item.docId === f7route.params.id)?.[0]
    settings.length > 0 && setBooking(temp)
  }, [bookings, settings])

  useEffect(() => {
    console.log({ units })
    if (units?.length > 0 && selectedProperty) { setSelectableUnits(units.filter(item => item.docId === selectedProperty)?.[0]) }
  }, [units])

  useEffect(() => {
    console.log({ booking })
    if (booking) {
      setSelectedTenant(booking.tenant.id)
      setSelectedProperty(booking.property.id)
      setSelectedUnit(booking.unit.id)
      let data = {
        date: dayjs(booking.date.toDate()).format('DD.MM.YYYY'),
        name: booking.name,
        channel: booking.channel,
        checkIn: dayjs(booking.checkIn.toDate()).format('DD.MM.YYYY'),
        checkOut: dayjs(booking.checkOut.toDate()).format('DD.MM.YYYY'),
        unit: selectedUnit,
        tenant: selectedTenant,
        property: selectedProperty,
        rent: currency(booking.rent, { symbol: '€', decimal: ',', separator: '.' }).format(),
        deposit: currency(booking.deposit, { symbol: '€', decimal: ',', separator: '.' }).format(),
        notes: booking.notes
      }
      f7.form.fillFromData("#bookingForm", data)
    }
  }, [booking])


  const handleCancel = () => {
    f7.form.fillFromData('#bookingForm', booking)
    setReadOnly(true)
  }

  const handleSave = () => {
    let data = f7.form.getFormData('#bookingForm')
    const payload = {
      ...data,
      unit: doc(db, 'units', selectedUnit),
      property: doc(db, 'properties', selectedProperty),
      tenant: doc(db, 'tenants', selectedTenant),
    }
    console.log({ payload })
    // f7.store.dispatch('updateOne', { collectionName: 'bookings', id: booking.docId, payload })
    setReadOnly(true)
  }


  const handlePropertyChange = ({ id }) => {
    setSelectedProperty(id)
    let formData = f7.form.getFormData('#bookingForm')
    console.log({ id, formData })
  }

  const handleUnitChange = ({ id }) => {
    setSelectedUnit(id)
    let formData = f7.form.getFormData('#bookingForm')
    console.log({ id, formData })
  }

  const handleTenantChange = ({ id }) => {
    setSelectedTenant(id)
    let formData = f7.form.getFormData('#bookingForm')
    console.log({ id, formData })
  }

  useEffect(() => { console.log("selectedUnit changed: ", { selectedUnit }) }, [selectedUnit])
  useEffect(() => { console.log("selectableUnits changed: ", { selectableUnits }) }, [selectableUnits])

  useEffect(() => {
    console.log("selectedProperty changed: ", { selectedProperty })
    setSelectableUnits(units.filter(unit => unit.property.id === selectedProperty))
  }, [selectedProperty])

  return (
    <Page name="form">
      <Navbar title="Booking " backLink="Back">
        {readOnly && <Button onClick={() => setReadOnly(false)}><Icon small material='edit' /></Button>}
        {readOnly || <Button small onClick={handleSave}><Icon material='save' /></Button>}
        {readOnly || <NavRight><Button small onClick={handleCancel} ><Icon material='close' /></Button></NavRight>}
      </Navbar>

      {booking && <Block>
        <form id="bookingForm" className="form-store-data"><h2 slot="header">Details</h2>
          <Row>
            <Col>
              <List noHairlines>
                <ListInput name='date' label="Booking date" type='datepicker' disabled />
              </List>
            </Col>
            <Col small>
              <List noHairlines>
                <ListInput name="rent" label="Rent" disabled={readOnly} />
              </List>
            </Col>
            <Col small>
              <List noHairlines>
                <ListInput name="deposit" label="Deposit" disabled={readOnly} />
              </List>
            </Col>
            <Col>
              <List noHairlines>
                <ListInput name='channel' type="select" label="Channel" disabled={readOnly}>
                  {settings.filter(item => item.docId === 'channels')[0].values.map(item => (<option key={item} value={item}>{item}</option>))}
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
                    events: [{
                      date: dayjs(booking.checkIn.toDate())
                    }],
                    minDate: dayjs().format('DD.MM.YYYY'),
                    value: [dayjs(booking.checkIn.toDate())]
                  }}
                  disabled={readOnly}
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
                    events: [{
                      date: dayjs(booking.checkOut.toDate())
                    }],
                    minDate: dayjs().format('DD.MM.YYYY'),
                    value: [dayjs(booking.checkOut.toDate())]
                  }}
                  disabled={readOnly}
                />
              </List>
            </Col>
            <Col small>
              <List noHairlines>
                <ListInput name="property" label="Property" type='select' onChange={(e) => handlePropertyChange({ id: e.target.value })} disabled={readOnly}>
                  {properties.map(property => (<option key={property.docId} value={property.docId} >{property.name}</option>))}
                </ListInput>
              </List>
            </Col>
            <Col small>
              <List noHairlines>
                <ListInput name="unit" label="Room" type='select' onChange={(e) => handleUnitChange({ id: e.target.value })} disabled={readOnly}>
                  {selectableUnits.map(unit => (<option key={unit.docId} value={unit.docId}>{unit.name}</option>))}
                </ListInput>
              </List>
            </Col>
            <Col small>
              <List noHairlines>
                <ListInput name="tenant" label="Tenant" type='select' onChange={(e) => handleTenantChange({ id: e.target.value })} disabled={readOnly}>
                  {tenants.map(tenant => (<option key={tenant.docId} value={tenant.docId}>{tenant.name}</option>))}
                </ListInput>
              </List>
            </Col>
            {/* <Col>
              <List noHairlines>
                <ListInput name='duration' label="Duration" disabled />
              </List>
            </Col>
            <Col>
              <List noHairlines>
                <ListInput name='durationUnits' label="Units" disabled />
              </List>
            </Col> */}
          </Row>
          <Row>
          </Row>
          <Row>

            {/* <Col small>
              <List noHairlines>
                <ListInput name="totalRevenue" label="Total revenue" disabled />
              </List>
            </Col> */}
          </Row>
          <List noHairlines>
            <ListItem >
              <h2 slot="header">Notes</h2>
            </ListItem>
            <ListInput
              name="notes"
              type="textarea"
              resizable
              placeholder="Enter notes here"
              disabled={readOnly}
            >
              <Icon material="notes" slot="media" />
            </ListInput>

          </List>
        </form>
      </Block>}
    </Page>
  );
}

export default BookingPage;
