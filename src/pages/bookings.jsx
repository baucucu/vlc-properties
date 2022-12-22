import React, { useState, useEffect, useRef } from 'react';
import { f7, Page, Navbar, Block, List, ListItem, useStore, Chip, Badge, Button, Popup, NavRight, Icon, Row, Col, ListInput, ListButton } from 'framework7-react';
import dayjs from 'dayjs';
import { PickerInline } from 'filestack-react';
import useFirestoreListener from "react-firestore-listener"
import { doc, arrayUnion } from 'firebase/firestore'
import { db } from '../utils/firebase'
import _ from 'lodash';


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
    const [selectedProperty, setSelectedProperty] = useState(properties[0]?.docId)
    const [selectableUnits, setSelectableUnits] = useState(units.filter(unit => unit?.property?.docId === selectedProperty))
    const [canSave, setCanSave] = useState(false)
    let [formData, setFormData] = useState({})

    async function handleSave() {
      console.log({ formData })
      let payload = {
        channel: formData.channel,
        deposit: Number(formData.deposit),
        rent: Number(formData.rent),
        notes: formData.notes,
        date: new Date(),
        checkIn: new Date(formData.checkIn),
        checkOut: new Date(formData.checkOut),
        tenant: doc(db, 'tenants', formData.tenant),
        unit: doc(db, 'units', formData.unit),
        property: doc(db, 'properties', formData.property)
      }
      console.log({ payload })
      f7.store.dispatch('createOne', { collectionName: 'bookings', payload }).then(ref => {
        payload = {
          bookings: arrayUnion(ref)
        }
        f7.store.dispatch('updateOne', { collectionName: 'tenants', id: formData.tenant, payload })
      })
      let increment = dayjs(formData.checkOut).diff(dayjs(formData.checkIn), 'day') < 30 ? 'day' : 'month'
      let day = formData.checkIn
      do {
        payload = {
          tenant: doc(db, 'tenants', formData.tenant),
          unit: doc(db, 'units', formData.unit),
          property: doc(db, 'properties', formData.property),
          amount: Number(formData.rent),
          date: new Date(day)
        }
        // debugger;
        f7.store.dispatch('createOne', { collectionName: 'revenue', payload })
        day = dayjs(day).add(1, increment)
      } while (dayjs(day).isBefore(dayjs(formData.checkOut)))

      handleClose()
    }
    function handleChange() {
      let data = f7.form.convertToData('#newBookingForm')
      console.log({ data })
      setFormData(data)
    }
    const handlePropertyChange = ({ id }) => {
      setSelectedProperty(id)
    }
    const handleUnitChange = ({ id }) => { }

    useEffect(() => { console.log({ settings }) }, [])

    useEffect(() => {
      console.log({ popupOpen, tenantPopupOpen })
    }, [popupOpen, tenantPopupOpen])

    useEffect(() => {
      setSelectableUnits(units.filter(unit => unit.property.id === selectedProperty))
    }, [selectedProperty])

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
                <List noHairlines>
                  <ListInput name="tenant" label="tenant" type='select' onChange={handleChange} disabled={readOnly}>
                    {_.sortBy(tenants, item => item.name).map(tenant => (<option key={tenant.docId} value={tenant.docId}>{tenant.name}</option>))}
                  </ListInput>
                  <ListButton onClick={() => { setTenantPopupOpen(true) }}>Add new tenant</ListButton>
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name='channel' type="select" label="Channel" onChange={handleChange} disabled={readOnly}>
                    {_.sortBy(settings.filter(item => item.docId === 'channels')[0]?.values, item => item)
                      .map(item => (<option key={item} value={item}>{item}</option>))}
                  </ListInput>
                </List>
              </Col>
            </Row>
            <Row>
              <Col small>
                <List noHairlines>
                  <ListInput name="property" label="Property" type='select' onChange={(e) => handlePropertyChange({ id: e.target.value })} disabled={readOnly}>
                    {_.sortBy(properties, item => item.name).map(property => (<option key={property.docId} value={property.docId} >{property.name}</option>))}
                  </ListInput>
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="unit" label="Room" type='select' onChange={(e) => handleUnitChange({ id: e.target.value })} disabled={readOnly}>
                    {
                      selectedProperty && _.sortBy(selectableUnits, item => Number(item.name.substring(5, item.name.length)))
                        .map(unit => (<option key={unit.docId} value={unit.docId}>{unit.name}</option>))
                    }
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
                      minDate: dayjs().format('DD.MM.YYYY'),
                    }}
                    disabled={readOnly}
                    onChange={handleChange}
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
                      minDate: dayjs().format('DD.MM.YYYY'),
                    }}
                    disabled={readOnly}
                    onChange={handleChange}
                  />
                </List>
              </Col>
            </Row>
            <Row>
              <Col small>
                <List noHairlines>
                  <ListInput name="rent" type="number" label="Rent" onChange={handleChange} disabled={readOnly} />
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="deposit" type="number" label="Deposit" onChange={handleChange} disabled={readOnly} />
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
                onChange={handleChange}
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
      console.log({ formData, uploads })
      let payload = {
        ...formData,
        uploads
      }
      f7.store.dispatch('createOne', { collectionName: 'tenants', payload })
      handletenantClose()
    }
    function handleChange() {
      let data = f7.form.convertToData('#newBookingtenantForm')
      console.log({ data })
      setFormData(data)
    }
    useEffect(() => {
      console.log("formData changed: ", { formData })
      let emptyFields = Object.keys(formData).filter(key => formData[key] === '' && key !== 'notes')
      console.log({ emptyFields })
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
              <Col>
                <List noHairlines>
                  <ListInput name="name" label="Name" onChange={handleChange} />
                  <ListInput name="email" label="Email" onChange={handleChange} />
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name="phone" label="Phone" onChange={handleChange} />
                  <ListInput
                    name="idNumber"
                    label="ID number"
                    onChange={handleChange}
                  >
                  </ListInput>
                </List>
              </Col>
            </Row>
            <Row>
              <Col>
                <List noHairlines>
                  <ListInput name="address" label="Permanent address" onChange={handleChange} />
                </List>
              </Col>
            </Row>
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
                console.log(res);
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
                onChange={handleChange}
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
                        // media="T"
                        mediaBgColor="black"
                        iconMaterial='person'
                        iconF7='person'
                        iconAurora='person'
                        iconIos='person'
                      >
                      </Chip>
                      <Chip
                        text={`${property.name} - ${unit.name}`}
                        // media="P"
                        mediaBgColor="black"
                        iconMaterial='business'
                        // iconF7='building'
                        iconAurora='building'
                      // iconIos='building'
                      // iconColor='white'
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
                  text={<Badge color="black">{booking.channel}</Badge>}
                // after={
                //   <div style={{ display: "flex", flexDirection: "row-reverse", gap: 16 }}>
                //     <Chip
                //       text={booking["Contract status"] || "N/A"}
                //       media="C"
                //       mediaBgColor='black'
                //     >
                //     </Chip>
                //   </div>
                // }

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
