import React, {useEffect,useState} from 'react';
import {
  Page,
  Navbar,
  List,
  ListInput,
  Input,
  ListItem,
  Toggle,
  BlockTitle,
  Row,
  Button,
  Range,
  Block,
  Col,
  Icon,
  NavRight,
  useStore,
  f7
} from 'framework7-react';
import lists from "../utils/static"
import store from '../js/store'
import dayjs from 'dayjs'
import currency from 'currency.js';

const BookingPage = ({f7route,f7router}) => {
  
  const bookings = useStore('bookings')
  const tenants = useStore('tenants')
  const properties = useStore('properties')
  const units = useStore('units')
  const booking = useStore('booking')
  console.log({booking})
  
  const [formData, setFormData] = useState()

  const [readOnly, setReadOnly] = useState(true)
  const [selectedProperty,setSelectedProperty] = useState(booking["Property"][0])
  const [selectedUnit, setSelectedUnit] = useState(booking["Unit"][0])
  const [selectableUnits, setSelectableUnits] = useState(units.filter(unit => unit["Property"][0] === booking["Property"][0]))
  
  const handleCancel = () => {
    f7.form.fillFromData('#bookingForm', formData)
    setReadOnly(true)
  }
  
  const handleSave = () => {
    let data = f7.form.getFormData('#bookingForm')
    data.unit = selectedUnit
    data.recordId = booking.id
    console.log({sent:data})
    if(JSON.stringify(data) !== JSON.stringify(formData)){
        store.dispatch('saveBooking',data)
    }
    setReadOnly(true)
  }
  
  useEffect(() =>{
    console.log("booking changed: ",{booking})
    setFormData({
      checkIn: booking["Check in"],
      checkOut: booking["Check out"],
      status: booking["Status"],
      type: booking["Type"],
      tenant: booking["Tenant"][0],
      property: booking["Property"][0],
      unit: booking["Unit"][0],
      notes: booking["Notes"],
      channel: booking["Channel"],
      date: dayjs(booking["Date"]).format('YYYY-MM-DD'),
      rent: currency( booking["Rent"], { symbol: '€', decimal: ',', separator: '.' }).format(),
      deposit: currency( booking["Deposit"], { symbol: '€', decimal: ',', separator: '.' }).format(),
      duration: booking["Duration"],
      durationUnits: booking["Duration units"],
      contractStatus:booking["Contract status"],
      contractURL: booking["Contract URL"],
      totalRevenue: currency( booking["Total revenue"], { symbol: '€', decimal: ',', separator: '.' }).format(),
    })
    f7.form.fillFromData("#bookingForm",formData)
  },[booking])

  const handlePropertyChange = ({id}) => {
    setSelectedProperty(id)
  }

  const handleUnitChange = ({id}) => {
    setSelectedUnit(id)
  }

  useEffect(() => {console.log("selectedUnit changed: ",{selectedUnit})},[selectedUnit])
  useEffect(() => {console.log("selectableUnits changed: ",{selectableUnits})},[selectableUnits])

  useEffect(() => {
    console.log("selectedProperty changed: ",{selectedProperty})
    setSelectableUnits(units.filter(unit => unit["Property"][0] === selectedProperty ))
  },[selectedProperty])
  
  return(
    <Page name="form">
      <Navbar title="Booking " backLink="Back">
        {readOnly && <Button onClick={() => setReadOnly(false)}>Edit</Button>}
          {readOnly || <div style={{display:"flex", gap:16}}>
              <Button small bgColor="teal" onClick={handleSave}>Save</Button>
              <Button small bgColor="red" onClick={handleCancel} >Cancel</Button>
          </div>}
          {/* {readOnly && <NavRight style={{gap: 8}}>
            {formData.status === "New booking" && <Button small onClick={confirmBooking} bgColor="teal">Confirm</Button>}
            <Button small onClick={rejectBooking} bgColor="red">Reject</Button>
          </NavRight>} */}
      </Navbar>
      
      <Block>
          <form id="bookingForm" className="form-store-data"><h2 slot="header">Details</h2>
            <Row>
              <Col>
                <List noHairlines>
                  <ListInput name='date' label="Booking date" type='datepicker' disabled/>
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name='channel' type="select" label="Channel"  disabled={readOnly}>
                    {lists.channel.map(item => (<option key={item} value={item}>{item}</option>))}
                  </ListInput>
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name='type' type="select" label="Type"  disabled={readOnly}>
                    {lists.type.map(item => (<option key={item} value={item}>{item}</option>))}
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
                      events:[{
                        date: dayjs(booking["Check in"])
                      }],
                      minDate: dayjs().format('YYYY-MM-DD'),
                      value: [dayjs(booking["Check in"])]
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
                      events:[{
                        date: dayjs(booking["Check out"])
                      }],
                      minDate:dayjs().format('YYYY-MM-DD'),
                      value: [dayjs(booking["Check out"])]
                    }}  
                    disabled={readOnly}
                  />
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name='duration' label="Duration" disabled/>
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name='durationUnits' label="Units" disabled/>
                </List>
              </Col>
            </Row>
            <Row>
              <Col>
                <List noHairlines>
                  <ListInput name='status' label="Status"  disabled>
                    {lists.status.map(item => (<option key={item} value={item}>{item}</option>))}
                  </ListInput>
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name='contractStatus' label="Contract status" disabled/>
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name='contractURL' label="Contract URL" disabled/>
                </List>
              </Col>
            </Row>
            <Row>
              <Col small>
                <List noHairlines>
                  <ListInput name="tenant" label="Tenant"  type='select' disabled={readOnly}>
                      {tenants.map(tenant => (<option key={tenant.id} value={tenant.id}>{tenant.Name}</option>))}
                  </ListInput>
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="property" label="Property"  type='select' onChange={(e) => handlePropertyChange({id:e.target.value})} disabled={readOnly}>
                    {properties.map(property => (<option key={property.id}  value={property.id} >{property.Name}</option>))}
                  </ListInput>
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="unit" label="Room"  type='select' onChange={(e)=>handleUnitChange({id:e.target.value})} disabled={readOnly}>
                    {
                      selectableUnits
                        .map(unit => (<option key={unit.id} value={unit.id}>{unit.Name}</option>))
                    }
                  </ListInput>
                </List>
              </Col>
            </Row>
            <Row>
              <Col small>
                <List noHairlines>
                  <ListInput name="rent" label="Rent" disabled={readOnly}/>
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="deposit" label="Deposit" disabled={readOnly}/>
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="totalRevenue" label="Total revenue" disabled/>
                </List>
              </Col>
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
                    <Icon material="notes" slot="media"/>  
                </ListInput>
                
            </List>
          </form>
      </Block>
    </Page>
  );
}

export default BookingPage;
