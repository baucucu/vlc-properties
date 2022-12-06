import React,{useEffect, useState} from 'react';
import { Page, Navbar, Block, List, ListItem, useStore, Row, Col,f7 } from 'framework7-react';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import currency from 'currency.js';

const ExpensesPage = () => {
  const expenses = useStore('expenses');
  const properties = useStore('properties')
  const [resources,setResources] = useState([])
  const [events,setEvents] = useState([])
  const [selected,setSelected] = useState(properties.map(property => property.id))
  

  useEffect(() => {
    const ss = f7.smartSelect.get('.smart-select')
    ss.on('close', function(el){
      console.log("selected element: ",el.selectEl.selectedOptions)
      let options = Array.from(el.selectEl.selectedOptions).map(option => option.value)
      console.log(options)
      setSelected(options)
    })
  },[])

  useEffect(() => {
    let res = properties.map(property => ({id: property.id, name: property.Name}))
    setResources(res)
    let evs = expenses
    .filter(expense => selected.find(prop => prop === expense.Property[0]))
    .map(expense => {
      let property =res.filter(item => item.id === expense.Property[0])[0] 
      return({
        id: expense.id,
        title: `${currency(expense.Amount, { symbol: '€', decimal: ',', separator: '.' }).format()} - ${expense.Expense}`,
        start: expense.Date, 
        extendedProps: {
          property: property.name,
        }
      })
    })
    console.log("events have changed: ", evs)
    setEvents(evs)
  },[selected])
  
  return (
    <Page>
      <Navbar title="Expenses"/>
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
                right: ''
              }}
            />
          </Block>
        </Col>      
      </Row>
    </Page>
  );
}
ExpensesPage
export default ExpensesPage;
