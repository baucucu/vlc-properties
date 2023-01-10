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
  useStore,
  Stepper,
  ListButton,
  Checkbox,
  BlockHeader
} from 'framework7-react';
import currency from 'currency.js';
import useFirestoreListener from "react-firestore-listener"
import { doc } from 'firebase/firestore'
import { db, getDocumentOnce } from '../utils/firebase'
import _ from 'lodash'
import dayjs from 'dayjs'
import googleDocsLogo from '../assets/google_docs_logo.png'
import store from '../js/store';
import ContractEmailForm from '../components/contractForm'
import { Timestamp } from 'firebase/firestore'
import PropertyRoomSelector from '../components/PropertyRoomSelector';


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

  const [installments, setInstallments] = useState([])

  useEffect(() => {
    if (!booking) {
      // let temp = bookings.filter(item => item.docId === f7route.params.id)?.[0]
      // settings.length > 0 && setBooking(temp)
    } else {
      setSelectedProperty(booking.property.id)
      setSelectedTenant(booking.tenant.id)
      setSelectedUnit(booking.unit.id)
      setInstallments(booking.installments || [])
      if (booking?.contracts?.length > 0) { setSelectedContract(booking.contracts[booking.contracts.length - 1]) } else { setSelectedContract() }
      resetForm()
    }
  }, [booking, settings])

  useEffect(() => {
    console.log({ bookings })
    let temp = bookings.filter(item => item.docId === f7route.params.id)?.[0]
    setBooking(temp)
    // setBooking([bookings.filter(item => item.docId === f7route.params.id)?.[0]])
  }, [bookings])

  useEffect(() => {
    if (!selectedProperty) { return }
    else if (selectedProperty === booking?.property?.id) {
      setSelectedUnit(booking.unit.id)
    } else {
      setSelectableUnits(properties.filter(item => item.docId === selectedProperty)[0].units)
      setSelectedUnit("")
    }
  }, [selectedProperty])

  useEffect(() => {
    if (units?.length > 0 && selectedProperty) { setSelectableUnits(units.filter(item => item.docId === selectedProperty)?.[0]) }
  }, [units])

  useEffect(() => {
    console.log({ selectedContract })
  }, [selectedContract])

  useEffect(() => {
    console.log({ installments })
  }, [installments])

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

  function resetForm() {
    let data = {
      date: dayjs(booking.date.toDate()).format('DD/MM/YYYY'),
      name: booking.name,
      type: booking.type,
      installments: booking.installments,
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
  }

  const handleCancel = () => {
    resetForm()
    setReadOnly(true)
  }

  const handleSave = () => {
    let data = f7.form.convertToData('#bookingForm')
    console.log({ data })
    let [d1, m1, y1] = data.checkIn.split('/')
    let date = new Date(y1, m1 - 1, d1).setHours(14, 0, 0, 0)
    const checkIn = Timestamp.fromMillis(date)
    const [d2, m2, y2] = data.checkOut.split('/')
    date = new Date(y2, m2 - 1, d2).setHours(8, 0, 0, 0)
    const checkOut = Timestamp.fromMillis(date)
    const rent = Number(currency(data.rent, { symbol: '€', decimal: ',', separator: '.' }).value)
    const yearlyRent = Number(currency(data.yearlyRent, { symbol: '€', decimal: ',', separator: '.' }).value)
    const amount = Number(currency(data.amount, { symbol: '€', decimal: ',', separator: '.' }).value)
    const deposit = Number(currency(data.deposit, { symbol: '€', decimal: ',', separator: '.' }).value)

    const payload = {
      channel: data.channel,
      amount,
      type: data.type,
      rent,
      installments,
      yearlyRent,
      deposit,
      notes: data.notes,
      checkIn,
      checkOut,
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
    // console.log({ id, formData })
  }

  const handleUnitChange = ({ id }) => {
    console.log({ changedUnit: id })
    // setSelectedUnit(id)
    let formData = f7.form.getFormData('#bookingForm')
    // console.log({ id, formData })
  }

  const handleTenantChange = ({ id }) => {
    setSelectedTenant(id)
    let formData = f7.form.getFormData('#bookingForm')
    // console.log({ id, formData })
  }

  function handleDelete() {
    f7.dialog.confirm('Are you sure you want to delete this booking?', 'Delete Booking', () => {
      f7.store.dispatch('deleteOne', { collectionName: 'bookings', id: booking.docId }).then(res => {
        f7.views.main.router.back()
      })
    })
  }

  function handleAddInstallment() {
    setInstallments(installments => [
      ...installments,
      { date: Timestamp.fromMillis(dayjs()), amount: 0, paid: false }
    ])
  }
  function handleRemoveInstallment() {
    setInstallments(installments => [...installments.slice(0, -1)])
  }

  function handleInstallmentChange({ prop, value }) {
    console.log({ prop, value })
    let tempInstallments = installments
    let [name, index, subproperty] = prop.split('.')
    tempInstallments[index][subproperty] = value
    setInstallments([...tempInstallments])
  }

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
              <List noHairlines style={{ marginTop: 0 }}>
                <ListInput name="type" type="select" label="Booking type" disabled={readOnly}>
                  <option value="" disabled>--Select--</option>
                  <option value="Short term">Short term</option>
                  <option value="Long term">Long term</option>
                </ListInput>
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
              <PropertyRoomSelector disabled={readOnly} properties={properties} units={units} setSelectedProperty={setSelectedProperty} selectedProperty={selectedProperty} setSelectedUnit={setSelectedUnit} selectedUnit={selectedUnit} />
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
          {booking.type === "Long term" && <>
            <Block>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 16, alignItems: 'center' }}>
                <h2 style={{ fontSize: 18 }}>Payments</h2>
                {readOnly || <Stepper round fill value={installments.length} onStepperMinusClick={() => { handleRemoveInstallment() }} onStepperPlusClick={() => { handleAddInstallment() }} />}
              </div>
              <Row style={{ display: 'flex', justifyContent: 'flex-start', gap: 16 }}>
                {installments.map((installment, index) => (
                  <Block key={index} className='col-25 elevation-2' style={{ backgroundColor: installment.paid ? "#00968860" : "#ff950060", borderRadius: 8, padding: 16, margin: 0, display: 'flex', flexDirection: 'row', gap: 16, listStyleType: 'none' }}>
                    <Col>
                      <small className="display-block">Paid</small>
                      <Input name={`installments.${index}.paid`} type='checkbox' checked={installment.paid} value={installment.paid} disabled={readOnly} onChange={(e) => { handleInstallmentChange({ prop: `installments.${index}.paid`, value: !installment.paid }) }} />
                    </Col>
                    <Col>
                      <small className="display-block">Due date</small>
                      <Input name={`installments.${index}.date`} label="Due date" type='datepicker' disabled={readOnly}
                        calendarParams={{
                          value: [installment.date ? dayjs(installment.date?.toDate()) : dayjs()],
                          locale: "en",
                          dateFormat: 'dd/mm/yyyy',
                          on: {
                            change: (calendar, value) => {
                              handleInstallmentChange({ prop: `installments.${index}.date`, value: Timestamp.fromMillis(dayjs(value[0])) })
                            }
                          }
                        }}
                      />
                    </Col>
                    <Col>
                      <small className="display-block">Amount</small>
                      <Input name={`installments.${index}.amount`} label="Amount" type='number'
                        value={currency(installment.amount, { symbol: '€', decimal: ',', separator: '.' })} disabled={readOnly}
                        onChange={e => handleInstallmentChange({ prop: `installments.${index}.amount`, value: Number(currency(e.target.value).value) })}
                      />
                    </Col>
                  </Block>
                ))}
                <Block style={{}}></Block>
              </Row>
            </Block>
          </>}
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
