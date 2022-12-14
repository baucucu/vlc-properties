import React, {useState, useEffect, useRef} from 'react';
import { f7, Page,Input, Navbar, Block, List, ListItem, useStore,Chip, Badge, Button, Popup, NavRight, Icon, Row,Col,ListInput, ListButton } from 'framework7-react';
import dayjs from 'dayjs';
import lists  from '../utils/static';
import { PickerInline,PickerDropPane, PickerOverlay   } from 'filestack-react';


const BookingsPage = () => {
  
  const bookings = useStore('bookings')
  const tenants = useStore('tenants')
  const properties = useStore('properties')
  const units = useStore('units')

  const [popupOpen, setPopupOpen] = useState(false)
  const [tenantPopupOpen, setTenantPopupOpen] = useState(false)

  function handleClose(){
    setPopupOpen(false)
  }
  function handleTenantClose() {
    setTenantPopupOpen(false)
  }

  function AddBooking({handleClose}){
    const [readOnly,setReadOnly] = useState(false)
    const [selectedProperty,setSelectedProperty] = useState(properties.map(property => property.id)[0])
    const [selectableUnits, setSelectableUnits] = useState(units.filter(unit => unit["Property"][0] === selectedProperty))
    const [canSave, setCanSave] = useState(false)
    let [formData, setFormData] = useState({})

    useEffect(() => {
      console.log({popupOpen,tenantPopupOpen})
    },[popupOpen,tenantPopupOpen])
    
    function handleSave() {
      f7.store.dispatch('addBooking',formData)
      handleClose()
    }
    function handleChange(){
      let data = f7.form.convertToData('#newBookingForm')
      console.log({data})
      setFormData(data)
    }

    const handlePropertyChange = ({id}) => {
      setSelectedProperty(id)
    }
  
    useEffect(() => {
      setSelectableUnits(units.filter(unit => unit["Property"][0] === selectedProperty ))
    },[selectedProperty])

    useEffect(() => {
      console.log("formData changed: ",{formData})
      let emptyFields = Object.keys(formData).filter(key => formData[key] === '' && key !== 'notes')
      console.log({emptyFields})
      if(Object.keys(formData).length >0 && emptyFields.length === 0){setCanSave(true)} else {setCanSave(false)}
    }, [formData])

    return(
      <Page>
        <Navbar title="Add new booking">
          {canSave && <Button onClick={handleSave}><Icon material='save'/></Button>}
          <NavRight>
            <Button onClick={handleClose}>
              <Icon  material="close"></Icon>
            </Button>
          </NavRight>
        </Navbar>
        <Block>
          <form id="newBookingForm" className="form-store-data">
            <Row>
              <Col small>
                <List noHairlines>
                  <ListInput name="tenant" label="Tenant"  type='select' onChange={handleChange} disabled={readOnly}>
                      {tenants.map(tenant => (<option key={tenant.id} value={tenant.id}>{tenant.Name}</option>))}
                  </ListInput>
                  <ListButton onClick={() => {setTenantPopupOpen(true)}}>Add new tenant</ListButton>
                </List>
              </Col>
              <Col>
              </Col>
            </Row>
            <Row>
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
                      minDate:dayjs().format('YYYY-MM-DD'),
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
                  <ListInput name="rent" label="Rent"  onChange={handleChange}  disabled={readOnly}/>
                </List>
              </Col>
              <Col small>
                <List noHairlines>
                  <ListInput name="deposit" label="Deposit"  onChange={handleChange}  disabled={readOnly}/>
                </List>
              </Col>
            </Row>
            <Row>
              <Col>
                <List noHairlines>
                  <ListInput name='channel' type="select" label="Channel"   onChange={handleChange}  disabled={readOnly}>
                    {lists.channel.map(item => (<option key={item} value={item}>{item}</option>))}
                  </ListInput>
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name='type' type="select" label="Type"   onChange={handleChange}  disabled={readOnly}>
                    {lists.type.map(item => (<option key={item} value={item}>{item}</option>))}
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
                    <Icon material="notes" slot="media"/>  
                </ListInput>
                
            </List>
          </form>
      </Block>
        
      </Page>
      
    )
  }

  function AddTenant({handleTenantClose}){
    const [canSave, setCanSave] = useState(false)
    const [formData, setFormData] = useState({})
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploads,setUploads] = useState([])
    
    function handleSave() {
      f7.store.dispatch('addTenant',{...formData,uploads})
      handleTenantClose()
    }
    function handleChange(){
      let data = f7.form.convertToData('#newBookingTenantForm')
      console.log({data})
      setFormData(data)
    }
    useEffect(() => {
      console.log("formData changed: ",{formData})
      let emptyFields = Object.keys(formData).filter(key => formData[key] === '' && key !== 'notes')
      console.log({emptyFields})
      if(emptyFields.length === 0){setCanSave(true)} else {setCanSave(false)}
    }, [formData])
    
    return(
      <Page>
        <Navbar title="Add new tenant">
          {canSave && <Button onClick={handleSave}><Icon material='save'/></Button>}
          <NavRight>
            <Button onClick={handleTenantClose}>
              <Icon  material="close"></Icon>
            </Button>
          </NavRight>
        </Navbar>
        <form id="newBookingTenantForm" className="form-store-data">
          <Block>
            <Row>
              <Col>
                <List noHairlines>
                  <ListInput name="name" label="Name" onChange={handleChange} />
                  <ListInput name="email" label="Email"  onChange={handleChange} />
                </List>
              </Col>
              <Col>
                <List noHairlines>
                  <ListInput name="phone" label="Phone"  onChange={handleChange} />
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
                {file.url ? <img src={file.url} width={40} slot="media"/> : <Icon material="file"/>}
              </ListItem>)}
            </List>
            <Button onClick={()=> setPickerOpen(true)}>Add files</Button>
            {pickerOpen && <PickerInline 
                apikey={import.meta.env.VITE_FILESTACK_KEY}
                pickerOptions={{}}
                onUploadDone={(res) => {
                console.log(res);
                setUploads([...uploads,...res.filesUploaded])
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
                  <Icon material="notes" slot="media"/>  
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
              let tenant = tenants.filter(tenant => tenant.id === booking.Tenant[0])[0]
              let property = properties.filter(property => property.id === booking.Property[0])[0]
              let unit = units.filter(unit => unit.id === booking.Unit[0])[0]
              return (
                <ListItem
                  key={booking.id}
                  link={`/bookings/${booking.id}`}
                  title={
                    <div style={{display:"flex", gap:16}}>
                      
                      <Chip 
                        text={tenant.Name} 
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
                        // color="teal"
                        // mediaBgColor="orange"
                      >  
                      </Chip>
                      
                    </div>
                  }
                  text={
                    <div style={{display:"flex", gap:4, marginTop: 16}}>
                      <Badge
                        color='gray'
                      >
                        {booking.Channel}
                      </Badge>
                      <Badge
                        color='gray'
                      >
                        {booking.Type}
                      </Badge>
                    </div>
                  }
                  after={
                    <div style={{display:"flex", flexDirection:"row-reverse",gap:16}}>
                      <Chip
                        text={booking["Contract status"] || "N/A"}
                        // color={booking["Contract status"] === "Signed" ? "teal" : "red"}
                        media="C"
                        mediaBgColor='black'
                      >
                      </Chip>
                      
                    </div>
                  }
                  
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
        <AddBooking handleClose={handleClose}/>
      </Popup>
      <Popup
        className="newTenant"
        opened={tenantPopupOpen}
        onPopupClosed={handleTenantClose}
        onPopupSwipeClose={handleTenantClose}
        onPopupClose={handleTenantClose}
      >
        <AddTenant handleTenantClose={handleTenantClose}/>
      </Popup>
    </Page>
  );
}

export default BookingsPage;
