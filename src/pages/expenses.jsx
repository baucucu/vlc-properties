import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, List, ListItem, ListInput, Row, Col, Popup, NavRight, Button, Icon, f7 } from 'framework7-react';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import currency from 'currency.js';
import dayjs from 'dayjs';
import _ from 'lodash';
import useFirestoreListener from "react-firestore-listener"
import { doc, arrayUnion } from 'firebase/firestore'
import { db } from '../utils/firebase'

const ExpensesPage = () => {
  const properties = useFirestoreListener({ collection: "properties" })
  const expenses = useFirestoreListener({ collection: "expenses" })
  const settings = useFirestoreListener({ collection: "settings" })
  const [selected, setSelected] = useState([])
  const [events, setEvents] = useState([])
  const [popupOpen, setPopupOpen] = useState(false);
  console.log({ properties })
  console.log({ expenses })
  console.log({ settings })

  function handleClose() {
    setPopupOpen(false);
  }

  useEffect(() => {
    setSelected(properties.map(item => item.docId))
  }, [properties])

  useEffect(() => {
    const ss = f7.smartSelect.get('#propertiesFilter > .smart-select')
    // const ss = f7.smartSelect.get('#propertiesFilter')
    ss.on('close', function (el) {
      let options = Array.from(el.selectEl.selectedOptions).map(option => option.value)
      console.log({ options })
      setSelected(options)
    })
  }, [])
  useEffect(() => { console.log({ events }) }, [events])

  useEffect(() => {
    console.log({ selected })
    let evs = expenses
      .filter(item => {
        return selected.find(propertyId => propertyId === item.property.id)
      })
      .map(item => {
        let property = properties.filter(property => property.docId === item.property.id)[0]
        return ({
          id: item.docId,
          title: `${currency(item.amount, { symbol: '€', decimal: ',', separator: '.' }).format()} - ${item.category} - ${item.description}`,
          start: item.date.toDate(),
          extendedProps: {
            property: property.name,
            category: item.category
          }
        })
      })
    setEvents(evs)
    const ss = f7.smartSelect.get('.smart-select')
    ss.setValue(selected)

  }, [selected, expenses])

  function AddExpenses({ handleClose }) {
    const [rows, setRows] = useState(1)
    const [canSave, setCanSave] = useState(false)
    let [formData, setFormData] = useState([])

    function handleSave() {
      console.log({ formData })
      let group = _.groupBy(formData, 'index')
      let payloads = Object.keys(group)
        .map(index => {
          let payload = {}
          group[index].forEach(el => {
            payload[el.property] = el.property === 'property' ? doc(db, 'properties', el.value) : el.property === 'date' ? new Date(el.value) : el.property === 'amount' ? Number(el.value) : el.value
          })
          return payload
        })
      console.log({ group, payloads })
      payloads.map(payload => f7.store.dispatch('createOne', { collectionName: 'expenses', payload }))
      handleClose()
    }
    function handleChange() {
      let data = f7.form.convertToData('#expensesForm')
      console.log({ data })
      let res = Object.keys(data).map(key => {
        let index = key[0]
        let property = key.substring(2, key.length)
        let value = data[key]
        return { index, property, value }
      })

      setFormData(res)
    }
    useEffect(() => {
      // console.log("formData changed: ", { formData })
      let emptyFields = formData.filter(item => item.value === '')
      // console.log({ emptyFields })
      if (formData.length > 0 && emptyFields.length === 0) { setCanSave(true) } else { setCanSave(false) }
    }, [formData])
    return (
      <Page>
        <Navbar title="Add new expenses">
          {canSave && <Button onClick={handleSave}><Icon material='save' /></Button>}
          <NavRight>
            <Button onClick={handleClose}>
              <Icon material="close"></Icon>
            </Button>
          </NavRight>
        </Navbar>
        <form id="expensesForm" className="form-store-data">
          <Block>
            {[...Array(rows).keys()].map(index => <ExpenseRow key={index} handleChange={handleChange} index={index} />)}
            <Button onClick={() => setRows(rows + 1)}>Add new expense</Button>
          </Block>
        </form>

      </Page>

    )
  }

  const ExpenseRow = ({ index, handleChange }) => {
    const today = dayjs().format('DD.MM.YYYY')
    return (
      <Block>
        <h4>Expense #{index + 1}</h4>
        <Row>
          <Col >
            <List noHairlines>
              <ListInput
                name={index + ".amount"}
                type="number"
                min={0}
                label="Amount"
                inner-start={<p>€</p>}
                placeholder="Enter amount"
                required
                onChange={handleChange}
              />
            </List>
          </Col>
          <Col>
            <List noHairlines>
              <ListInput
                name={index + ".date"}
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
                name={index + ".property"}
                type="select"
                defaultValue={() => properties[0].docId}
                placeholder="Please choose..."
                required
                label="Property"
                onChange={handleChange}
              >
                {_.sortBy(properties, item => item.name).map(item => <option key={item.docId} value={item.docId}>{item.name}</option>)}
              </ListInput>
            </List>
          </Col>
        </Row>
        <Row>
          <Col width="35">
            <List noHairlines>
              <ListInput
                name={index + ".category"}
                type="select"
                placeholder="Please choose..."
                required
                label="Category"
                onChange={handleChange}
              >
                {_.sortBy(settings.filter(item => item.docId === 'expenseCategories')[0]?.values, item => item)
                  .map(category => <option key={category} value={category}>{category}</option>)}
              </ListInput>
            </List>
          </Col>
          <Col width="65">
            <List noHairlines>
              <ListInput
                name={index + ".description"}
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
      </Block >
    )
  }

  return (
    <Page>
      <Navbar title="Expenses">
        <Button onClick={() => setPopupOpen(true)}>
          <Icon material="add" />
        </Button>
      </Navbar>
      <Row>
        <Col>
          <Block>
            <List>
              <ListItem title="Filter properties" smartSelect id="propertiesFilter" smartSelectParams={{ openIn: 'popover' }} >
                <select className="filter" name="filter" multiple >
                  {_.sortBy(properties, item => item.name).map(item => <option key={item.docId} value={item.docId}>{item.name}</option>)}
                </select>
              </ListItem>
            </List>
            <FullCalendar
              height="70vh"
              initialView="listMonth"
              events={events}
              plugins={[listPlugin]}
              eventDidMount={function (info) {
                var propertyEl = info.el.getElementsByClassName('fc-list-event-time')[0]
                propertyEl.innerHTML = info.event.extendedProps.property
                var amountEl = info.el.getElementsByClassName('fc-list-event-dot')[0];
                amountEl.style.display = "none";
              }}
              headerToolbar={{
                left: 'today prev next',
                center: 'title',
                right: ''
              }}
            // customButtons={{
            //   addExpenses: {
            //     text: "Add expenses",
            //     click: () => setPopupOpen(true)
            //   }
            // }}
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
        <AddExpenses handleClose={handleClose} />
      </Popup>
    </Page>
  );
}

export default ExpensesPage;

