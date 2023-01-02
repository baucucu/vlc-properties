import React, { useEffect, useState } from 'react';
import {
  Page,
  Navbar,
  List,
  ListInput,
  Input,
  ListItem,
  Row,
  Button,
  Block,
  Col,
  Icon,
  NavRight,
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  f7,
  useStore
} from 'framework7-react';
import currency from 'currency.js';
import useFirestoreListener from "react-firestore-listener"
import { doc } from 'firebase/firestore'
import { db, auth, getDocumentOnce } from '../utils/firebase'
import _ from 'lodash'
import dayjs from 'dayjs'
import googleDocsLogo from '../assets/google_docs_logo.png'
import store from '../js/store';
import ContractEmailForm from '../components/contractForm'

const BookingPage = ({ f7route }) => {
  const templates = useStore('templates')
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

  const [selectedTemplate, setSelectedTemplate] = useState()
  const [selectedContract, setSelectedContract] = useState()

  const [contractPopupOpen, setContractPopupOpen] = useState(false)

  useEffect(() => {
    console.log({ selectedContract })
  }, [selectedContract])

  function handleContractPopupClose() {
    setContractPopupOpen(false)
  }

  async function generateContract() {
    const payload = {
      template: selectedTemplate,
      tenant: await getDocumentOnce({ collectionName: 'tenants', id: booking.tenant.id }),
      property: await getDocumentOnce({ collectionName: 'properties', id: booking.property.id }),
      unit: await getDocumentOnce({ collectionName: 'units', id: booking.unit.id }),
      booking: await getDocumentOnce({ collectionName: 'bookings', id: booking.docId }),
      bookingId: booking.docId,
    }
    store.dispatch('generateContract', { payload })
  }

  async function sendContract() {
    let { title, body } = settings.filter(item => item.docId === 'emailTemplate')[0]

    const payload = {
      title,
      body,
      contract: { ...selectedContract, pdf: `https://docs.google.com/document/d/${selectedContract.id}/export?format=pdf` },
      tenant: await getDocumentOnce({ collectionName: 'tenants', id: booking.tenant.id }),
      property: await getDocumentOnce({ collectionName: 'properties', id: booking.property.id }),
      unit: await getDocumentOnce({ collectionName: 'units', id: booking.unit.id }),
      booking: await getDocumentOnce({ collectionName: 'bookings', id: booking.docId }),
      bookingId: booking.docId,
    }
    debugger;
    store.dispatch('sendContract', { payload })
  }

  useEffect(() => {
    // console.log({ bookings })
    let temp = bookings.filter(item => item.docId === f7route.params.id)?.[0]
    settings.length > 0 && setBooking(temp)
  }, [bookings, settings])

  useEffect(() => {
    // console.log({ units })
    if (units?.length > 0 && selectedProperty) { setSelectableUnits(units.filter(item => item.docId === selectedProperty)?.[0]) }
  }, [units])

  useEffect(() => {
    console.log({ booking })
    if (booking) {
      setSelectedUnit(booking.unit.id)
      setSelectedTenant(booking.tenant.id)
      setSelectedProperty(booking.property.id)

      let data = {
        date: dayjs(booking.date.toDate()).format('DD/MM/YYYY'),
        name: booking.name,
        channel: booking.channel,
        checkIn: dayjs(booking.checkIn.toDate()).format('DD/MM/YYYY'),
        checkOut: dayjs(booking.checkOut.toDate()).format('DD/MM/YYYY'),
        unit: booking.unit.id,
        tenant: booking.tenant.id,
        property: booking.property.id,
        rent: currency(booking.rent, { symbol: '€', decimal: ',', separator: '.' }).format(),
        deposit: currency(booking.deposit, { symbol: '€', decimal: ',', separator: '.' }).format(),
        amount: currency(booking.amount, { symbol: '€', decimal: ',', separator: '.' }).format(),
        yearlyRent: currency(booking.yearlyRent, { symbol: '€', decimal: ',', separator: '.' }).format(),
        notes: booking.notes
      }
      f7.form.fillFromData("#bookingForm", data)
      if (booking?.contracts?.length > 0) { setSelectedContract(booking.contracts[booking.contracts.length - 1]) }
    }
  }, [booking])


  const handleCancel = () => {
    f7.form.fillFromData('#bookingForm', booking)
    setReadOnly(true)
  }

  const handleSave = () => {
    let data = f7.form.convertToData('#bookingForm')
    const checkInParts = data.checkIn.split('/')
    const checkIn = dayjs(`${checkInParts[1]}/${checkInParts[0]}/${checkInParts[2]}`).unix()
    const checkOutParts = data.checkOut.split('/')
    const checkOut = dayjs(`${checkOutParts[1]}/${checkOutParts[0]}/${checkOutParts[2]}`).unix()
    // const dateInParts = data.date.split('/')
    // const date = dayjs(`${dateInParts[1]}/${dateInParts[0]}/${dateInParts[2]}`)
    const rent = Number(currency(data.rent, { symbol: '€', decimal: ',', separator: '.' }).value)
    const yearlyRent = Number(currency(data.yearlyRent, { symbol: '€', decimal: ',', separator: '.' }).value)
    const amount = Number(currency(data.amount, { symbol: '€', decimal: ',', separator: '.' }).value)
    const deposit = Number(currency(data.deposit, { symbol: '€', decimal: ',', separator: '.' }).value)

    const payload = {
      channel: data.channel,
      amount,
      rent,
      yearlyRent,
      deposit,
      notes: data.notes,
      checkIn: new Date(checkIn * 1000),
      checkOut: new Date(checkOut * 1000),
      tenant: doc(db, 'tenants', selectedTenant || booking.tenant.id),
      unit: doc(db, 'units', selectedUnit || booking.unit.id),
      property: doc(db, 'properties', selectedProperty || booking.property.id),
    }
    console.log({ payload })
    f7.store.dispatch('updateOne', { collectionName: 'bookings', id: booking.docId, payload })
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

  function handleDelete() {
    f7.dialog.confirm('Are you sure you want to delete this booking?', 'Delete Booking', () => {
      f7.store.dispatch('deleteOne', { collectionName: 'bookings', id: booking.docId }).then(res => {
        f7.views.main.router.back()
      })
    })
  }

  useEffect(() => { console.log("selectedUnit changed: ", { selectedUnit }) }, [selectedUnit])
  useEffect(() => { console.log("selectableUnits changed: ", { selectableUnits }) }, [selectableUnits])



  useEffect(() => {
    console.log("selectedProperty changed: ", { selectedProperty })
    setSelectableUnits(units.filter(unit => unit.property.id === selectedProperty))
    setSelectedUnit(selectableUnits[0])
  }, [selectedProperty])



  return (
    <Page name="form">
      <Navbar title='Booking' backLink="Back">
        {readOnly && <Button onClick={() => setReadOnly(false)}><Icon small material='edit' /></Button>}
        {readOnly || <Button small onClick={handleSave}><Icon material='save' /></Button>}
        {readOnly || <Button onClick={handleDelete}>Delete</Button>}
        {readOnly || <NavRight><Button small onClick={handleCancel} ><Icon material='close' /></Button></NavRight>}
      </Navbar>

      {booking && <Block>
        <form id="bookingForm" className="form-store-data">
          <List noHairlines style={{ margin: 0 }}>
            <ListItem >
              <h2 slot="header" style={{ margin: 0 }}>Details</h2>
            </ListItem>
          </List >
          <Row>
            <Col>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput name='date' label="Booking date" type='datepicker' disabled />
              </List>
            </Col>
            <Col>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput name='channel' type="select" label="Channel" disabled={readOnly}>
                  {settings.filter(item => item.docId === 'channels')[0].values.map(item => (<option key={item} value={item}>{item}</option>))}
                </ListInput>
              </List>
            </Col>
          </Row>
          <Row>
            <Col small>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput name="rent" label="Monthly rent" disabled={readOnly} />
              </List>
            </Col>
            <Col small>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput name="yearlyRent" label="Yearly rent" disabled={readOnly} />
              </List>
            </Col>
            <Col small>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput name="deposit" label="Deposit" disabled={readOnly} />
              </List>
            </Col>
            <Col small>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput name="amount" label="Total amount" disabled={readOnly} />
              </List>
            </Col>

          </Row>
          <Row>
            <Col>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput
                  name="checkIn"
                  label="Check in"
                  type='datepicker'
                  calendarParams={{
                    events: [{
                      date: dayjs(booking.checkIn.toDate())
                    }],
                    minDate: dayjs(),
                    value: [dayjs(booking.checkIn.toDate())],
                    locale: "en",
                    dateFormat: 'dd/mm/yyyy'
                  }}
                  disabled={readOnly}
                />
              </List>
            </Col>
            <Col small>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput
                  name="checkOut"
                  label="Check out"
                  type='datepicker'
                  calendarParams={{
                    events: [{
                      date: dayjs(booking.checkOut.toDate())
                    }],
                    minDate: dayjs(),
                    value: [dayjs(booking.checkOut.toDate())],
                    locale: "en",
                    dateFormat: 'dd/mm/yyyy'
                  }}
                  disabled={readOnly}
                />
              </List>
            </Col>
            <Col small>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput name="property" label="Property" type='select' defaultValue={booking.property.id} onChange={(e) => handlePropertyChange({ id: e.target.value })} disabled={readOnly}>
                  {properties.map(property => (<option key={property.docId} value={property.docId} >{property.name}</option>))}
                </ListInput>
              </List>
            </Col>
            <Col small>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput name="unit" label="Room" type='select' defaultValue={booking.unit.id} onChange={(e) => handleUnitChange({ id: e.target.value })} disabled={readOnly}>
                  {_.sortBy(selectableUnits, item => item.name).map(unit => (<option key={unit.docId} value={unit.docId}>{unit.name}</option>))}
                </ListInput>
              </List>
            </Col>
            <Col small>
              <List noHairlines style={{ margin: 0 }}>
                <ListInput name="tenant" label="Tenant" type='select' defaultValue={booking.tenant.id} onChange={(e) => handleTenantChange({ id: e.target.value })} disabled={readOnly}>
                  {tenants.map(tenant => (<option key={tenant.docId} value={tenant.docId}>{tenant.name}</option>))}
                </ListInput>
              </List>
            </Col>
          </Row>
          <List noHairlines>
            <ListItem >
              <h2 slot="header">Contract</h2>
            </ListItem>
            <Row>
              <Col >
                <Card>
                  <CardHeader>Contract template</CardHeader>
                  <CardContent>
                    <List noHairlines>
                      <ListInput name="template" type='select' defaultValue={templates[0].id} onChange={(e) => setSelectedTemplate(e.target.value)}>
                        {templates.filter(template => template.name !== 'Contracts').map(template => (<option key={template.id} value={template.id}>{template.name}</option>))}
                      </ListInput>
                    </List>
                  </CardContent>
                  <CardFooter>
                    <Button disabled={!selectedTemplate} onClick={async () => await generateContract()}>Generate contract</Button>
                  </CardFooter>
                </Card>
              </Col>
              <Col>
                {selectedContract && <Card>
                  <CardHeader>Contracts</CardHeader>
                  <CardContent>
                    <List noHairlines>
                      <ListInput type='select' name='contract' onChange={(e) => setSelectedContract(e.target.value)} defaultValue={selectedContract.id}>
                        {booking.contracts && booking.contracts.map(contract => (<option key={contract.id} value={contract.id}>{contract.name}</option>))}
                        {/* <img slot="media" src={googleDocsLogo} width={16} style={{ marginRight: 4 }} /> */}
                      </ListInput>
                    </List>
                  </CardContent>
                  <CardFooter>
                    <a className="link external" href={`https://docs.google.com/document/d/${selectedContract.id}/edit#`} target='blank'>
                      <b>OPEN</b>
                    </a>
                    <Button onClick={() => { setContractPopupOpen(true) }}>Send</Button>
                  </CardFooter>
                </Card>}
              </Col>
            </Row>
          </List>
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
      {booking && selectedContract && <ContractEmailForm
        contractPopupOpen={contractPopupOpen}
        handleContractPopupClose={handleContractPopupClose}
        booking={booking}
        contract={selectedContract}
        property={properties.filter(property => property.docId === booking.property.id)[0]}
        tenant={tenants.filter(tenant => tenant.docId === booking.tenant.id)[0]}
        unit={units.filter(unit => unit.docId === booking.unit.id)[0]}
      />}
    </Page >
  );
}

export default BookingPage;
