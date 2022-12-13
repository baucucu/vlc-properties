import React,{useEffect, useState, useRef} from 'react';
import { Page, Navbar, Block, List, ListItem, ListInput, useStore, Row, Col, Popup, NavRight, Button, Icon, f7 } from 'framework7-react';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import currency from 'currency.js';
import store from '../js/store';
import dayjs from 'dayjs'
import _ from 'lodash'
import lists from '../utils/static'

const ExpensesPage = () => {
  const expenses = useStore('expenses');
  const properties = useStore('properties')
  const selected = useStore('selected');
  const [events,setEvents] = useState([])
  const [popupOpen, setPopupOpen] = useState(false)
  const popup = useRef(null)

  function handleClose(){
    setPopupOpen(false)
  }
  function saveExpenses(){

  }

  useEffect(() => {
    const ss = f7.smartSelect.get('.smart-select')
    ss.on('close', function(el){
      console.log("selected element: ",el.selectEl.selectedOptions)
      let options = Array.from(el.selectEl.selectedOptions).map(option => option.value)
      store.dispatch('setSelected',options)
    })
  },[])

  useEffect(() => {
    
    let evs = expenses
    .filter(expense => selected.find(prop => prop === expense.Property[0]))
    .map(expense => {
      let property =properties.filter(item => item.id === expense.Property[0])[0] 
      return({
        id: expense.id,
        title: `${currency(expense.Amount, { symbol: '€', decimal: ',', separator: '.' }).format()} - ${expense.Category} - ${expense.Expense}`,
        start: expense.Date, 
        extendedProps: {
          property: property.Name,
          category: expense.Category
        }
      })
    })
    setEvents(evs)
  },[selected])

  
  function AddExpenses({handleClose, saveExpenses}){
    const [rows,setRows] = useState(1)
    const [canSave, setCanSave] = useState(false)
    let [formData, setFormData] = useState([])
    function handleSave() {
      f7.store.dispatch('saveExpenses',{formData})
      handleClose()
    }
    function handleChange(){
      let data = f7.form.convertToData('#expensesForm')
      console.log({data})
      let res = Object.keys(data).map(key => {
        let index= key[0]
        let property=key.substring(2,key.length)
        let value=data[key]
        return {index,property,value}
      })
      
      setFormData(res)
    }
    useEffect(() => {
      console.log("formData changed: ",{formData})
      let emptyFields = formData.filter(item => item.value === '')
      console.log({emptyFields})
      if(formData.length>0 && emptyFields.length === 0){setCanSave(true)} else {setCanSave(false)}
    }, [formData])
    return(
      <Page>
        <Navbar title="Add new expenses">
          {canSave && <Button bgColor="teal" onClick={handleSave}>Save</Button>}
          <NavRight>
            <Button onClick={handleClose}>
              <Icon  material="close"></Icon>
            </Button>
          </NavRight>
        </Navbar>
        <form id="expensesForm" className="form-store-data">
          <Block>
            {[...Array(rows).keys()].map(index => <ExpenseRow key={index} handleChange={handleChange} index={index}/>)}
            <Button onClick={()=> setRows(rows+1)}>Add new expense</Button>
          </Block>
        </form>
        
      </Page>
      
    )
  }

  const ExpenseRow = ({index,handleChange}) => {
    const today = dayjs().format('YYYY-MM-DD')
    return(
      <Block>
        <h4>Expense #{index+1}</h4>
        <Row>
          <Col >
            <List noHairlines>
              <ListInput
                name={index+".amount"}
                type="number"
                min={0}
                label="Amount"
                inner-start={<p>€</p>}
                placeholder="Enter amount"
                // defaultValue={0}
                required
                onChange={handleChange}
              />
            </List>
          </Col>
          <Col>
            <List noHairlines>
              <ListInput
                name={index+".date"}
                type="date"
                defaultValue={today}
                format="DD MMM YYYY"
                placeholder="Please choose..."
                label="Expense date"
                required
                onChange={handleChange}
              />
            </List>
          </Col>
          <Col>
            <List noHairlines>
              <ListInput
                name={index+".property"}
                type="select"
                defaultValue={() => properties.map(property => property.id)[0]}
                placeholder="Please choose..."
                required
                label="Property"
                onChange={handleChange}
              >
                {properties.map(property => <option key={property.id} value={property.id}>{property.Name}</option>)}
              </ListInput>
            </List>
          </Col>
        </Row>
        <Row>
          <Col width="35">
            <List noHairlines>
              <ListInput
                name={index+".category"}
                type="select"
                // defaultValue={lists.expenseCategories[0]}
                placeholder="Please choose..."
                required
                label="Category"
                onChange={handleChange}
              >
                {lists.expenseCategories.map(category => <option key={category} value={category}>{category}</option>)}
              </ListInput>
            </List>
          </Col>
          <Col width="65">
            <List noHairlines>
              <ListInput
                name={index+".description"}
                label="Description"
                type="textarea"
                resizable
                required
                placeholder="Enter description here"
                onChange={handleChange}
              />
            </List>
          </Col>
        </Row>
        <hr/>
      </Block>
    )
  }
  return (
    <Page>
      <Navbar title="Expenses">
      </Navbar>
      <Row>
        <Col>
          <Block>
            <List>
              <ListItem title="Filter properties" smartSelect smartSelectParams={{ openIn: 'popover' }}>
                <select className="filter" name="filter" multiple defaultValue={selected}>
                  {properties.map(property => <option key={property.id} value={property.id}>{property.Name}</option>)}
                </select>
                
              </ListItem>
            </List>
            <FullCalendar 
              height="70vh"
              initialView="listMonth"
              events={events}
              plugins={[listPlugin]}
              // resources={resources}
              eventDidMount={function(info) {
                var propertyEl = info.el.getElementsByClassName('fc-list-event-time')[0]
                propertyEl.innerHTML = info.event.extendedProps.property
                var amountEl = info.el.getElementsByClassName('fc-list-event-dot')[0];
                amountEl.style.display="none"; 
              }}
              headerToolbar={{
                left: 'today prev next',
                center: 'title',
                right: 'addExpenses'
              }}
              customButtons={{
                addExpenses: {
                  text: "Add expenses",
                  click: () => setPopupOpen(true)
                }
              }}
            />
          </Block>
        </Col>      
      </Row>
      <Popup
        className="expenses"
        opened={popupOpen}
        onPopupClosed={handleClose}
        onPopupSwipeClose={handleClose}
        onPopupClose={handleClose}
      >
        <AddExpenses handleClose={handleClose} saveExpenses={saveExpenses}/>
      </Popup>
    </Page>
  );
}

export default ExpensesPage;

