import React, { useState, useEffect, useRef } from 'react';
import { f7, Page, Input, Navbar, Block, List, ListItem, useStore, Chip, Badge, Button, Popup, NavRight, Icon, Row, Col, ListInput, ListButton } from 'framework7-react';
import dayjs from 'dayjs';
import { PickerInline, PickerDropPane, PickerOverlay } from 'filestack-react';
import useFirestoreListener from "react-firestore-listener"



const BookingsPage = () => {
  const settings = useFirestoreListener({ collection: "settings" })
  const properties = useFirestoreListener({ collection: "properties" })
  const tennants = useFirestoreListener({ collection: "tennants" })
  const units = useFirestoreListener({ collection: "units" })
  const bookings = useFirestoreListener({ collection: "bookings" })

  const [popupOpen, setPopupOpen] = useState(false)
  const [tennantPopupOpen, setTennantPopupOpen] = useState(false)

  function handleClose() {
    setPopupOpen(false)
  }
  function handletennantClose() {
    setTennantPopupOpen(false)
  }

  function AddBooking({ handleClose }) {
    const [readOnly, setReadOnly] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState(properties[0]?.docId)
    const [selectableUnits, setSelectableUnits] = useState(units.filter(unit => unit?.property?.docId === selectedProperty))
    const [canSave, setCanSave] = useState(false)
    let [formData, setFormData] = useState({})

    function handleSave() {
      f7.store.dispatch('addBooking', formData)
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
      console.log({ popupOpen, tennantPopupOpen })
    }, [popupOpen, tennantPopupOpen])

    useEffect(() => {
      setSelectableUnits(units.filter(unit => unit["Property"][0] === selectedProperty))
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
                  <ListInput name="tennant" label="tennant" type='select' onChange={handleChange} disabled={readOnly}>
                    {tennants.map(tennant => (<option key={tennant.id} value={tennant.id}>{tennant.Name}</option>))}
                  </ListInput>
                  <ListButton onClick={() => { setTennantPopupOpen(true) }}>Add new tennant</ListButton>
                </List>
              </Col>
              <Col>
              </Col>
            </Row>
            <Row>
              <Col small>
                <List noHairlines>
                  <ListInput name="property" label="Property" type='select' onChange={(e) => handlePropertyChange({ id: e.target.value })} disabled={readOnly}>
                    {properties.map(property => (<option key={property.id} value={property.id} >{property.Name}</option>))}
                  </ListInput>
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="unit" label="Room" type='select' onChange={(e) => handleUnitChange({ id: e.target.value })} disabled={readOnly}>
                    {
                      selectedProperty && selectableUnits
                        .map(unit => (<option key={unit.id} value={unit.id}>{unit.Name}</option>))
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
                      minDate: dayjs().format('YYYY-MM-DD'),
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
                      minDate: dayjs().format('YYYY-MM-DD'),
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
                  <ListInput name="rent" label="Rent" onChange={handleChange} disabled={readOnly} />
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="deposit" label="Deposit" onChange={handleChange} disabled={readOnly} />
                </List>
              </Col>
            </Row>
            <Row>
              <Col>
                <List noHairlines>
                  <ListInput name='channel' type="select" label="Channel" onChange={handleChange} disabled={readOnly}>
                    {settings.filter(item => item.docId === 'channels')[0]
                      ?.values.map(item => (<option key={item} value={item}>{item}</option>))}
                  </ListInput>
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
              >
                <Icon material="notes" slot="media" />
              </ListInput>

            </List>
          </form>
        </Block>

      </Page>

    )
  }

  function Addtennant({ handletennantClose }) {
    const [canSave, setCanSave] = useState(false)
    const [formData, setFormData] = useState({})
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploads, setUploads] = useState([])

    function handleSave() {
      f7.store.dispatch('addtennant', { ...formData, uploads })
      handletennantClose()
    }
    function handleChange() {
      let data = f7.form.convertToData('#newBookingtennantForm')
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
        <Navbar title="Add new tennant">
          {canSave && <Button onClick={handleSave}><Icon material='save' /></Button>}
          <NavRight>
            <Button onClick={handletennantClose}>
              <Icon material="close"></Icon>
            </Button>
          </NavRight>
        </Navbar>
        <form id="newBookingtennantForm" className="form-store-data">
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
            bookings.map(booking => {
              let tennant = tennants.filter(tennant => tennant.docId === booking.tennant.id)[0]
              let property = properties.filter(property => property.docId === booking.property.id)[0]
              let unit = units.filter(unit => unit.docId === booking.unit.id)[0]
              return (
                <ListItem
                  key={booking.docId}
                  link={`/bookings/${booking.docId}`}
                  title={
                    <div style={{ display: "flex", gap: 16 }}>

                      <Chip
                        text={tennant.name}
                        media="T"
                        mediaBgColor="black"
                      >
                      </Chip>
                      <Chip
                        text={`${property.Name} - ${unit.Name}`}
                        media="P"
                        mediaBgColor="black"
                      >
                      </Chip>
                      <Chip
                        text={`${dayjs(booking["Check in"]).format("D MMM YY")} to ${dayjs(booking["Check out"]).format("D MMM YY")}`}
                      >
                      </Chip>

                    </div>
                  }
                  text={<Badge color="black">{booking.Channel}</Badge>}
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
        className="newtennant"
        opened={tennantPopupOpen}
        onPopupClosed={handletennantClose}
        onPopupSwipeClose={handletennantClose}
        onPopupClose={handletennantClose}
      >
        <Addtennant handletennantClose={handletennantClose} />
      </Popup>
    </Page>
  );
}

export default BookingsPage;
