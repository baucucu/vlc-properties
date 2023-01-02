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
import store from '../js/store';

const ExpensesPage = () => {
  const properties = useFirestoreListener({ collection: "properties" })
  const expenses = useFirestoreListener({ collection: "expenses" })
  const settings = useFirestoreListener({ collection: "settings" })
  const [selected, setSelected] = useState([])
  const [events, setEvents] = useState([])
  const [popupOpen, setPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [expense, setExpense] = useState({})

  function handleClose() {
    setPopupOpen(false);
  }
  function handleEditPopupClose() {
    setEditPopupOpen(false);
  }

  useEffect(() => {
    // console.log({ expense })
  }, [expense])

  useEffect(() => {
    setSelected(properties.map(item => item.docId))
  }, [properties])

  useEffect(() => {
    const ss = f7.smartSelect.get('#propertiesFilter > .smart-select')
    ss.on('close', function (el) {
      let options = Array.from(el.selectEl.selectedOptions).map(option => option.value)
      // console.log({ options })
      setSelected(options)
    })
  }, [])
  // useEffect(() => { console.log({ events }) }, [events])

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

  function EditExpense({ handleEditPopupClose, expense }) {
    const [canSave, setCanSave] = useState(false)
    const [formData, setFormData] = useState({})

    useEffect(() => {
      // console.log({ formData })
      if (Object.keys(formData).length > 0) {
        let emptyFields = Object.keys(formData).filter(key => formData[key] === '')
        if (emptyFields.length === 0) { setCanSave(true) }
      }
    }, [formData])

    useEffect(() => {
      // console.log({ expense })
      if (Object.keys(expense).length > 0) {
        let data = {
          property: expense.property.id,
          date: expense.date,
          category: expense.category,
          description: expense.description,
          amount: expense.amount
        }
        // console.log({ initial: data })
        setFormData(data)
      }
    }, [expense])

    function handleChange({ prop, value }) {
      const data = { ...formData }
      data[prop] = value
      setFormData(data)
    }

    function handleSave() {
      // console.log({ save: formData })
      let data = {
        property: doc(db, "properties", formData.property),
        date: new Date(formData.date.seconds * 1000),
        category: formData.category,
        description: formData.description,
        amount: formData.amount
      }
      // console.log({ saving: data })
      store.dispatch('updateOne', { collectionName: 'expenses', id: expense.docId, payload: data }).then(res => {
        // console.log({ res })
        handleEditPopupClose()
      })
    }

    function handleDelete() {
      f7.dialog.confirm('Are you sure you want to delete this expense?', 'Delete expense', () => {
        store.dispatch('deleteOne', { collectionName: 'expenses', id: expense.docId }).then(res => {
          // console.log({ res })
          handleEditPopupClose()
        })
      })
    }
    return (
      <Page>
        <Navbar title="Edit expense">
          {canSave && <Button onClick={handleSave}><Icon material='save' /></Button>}
          <Button onClick={() => handleDelete()}>Delete</Button>
          <NavRight>
            <Button onClick={handleEditPopupClose}>
              <Icon material="close"></Icon>
            </Button>
          </NavRight>
        </Navbar>
        {Object.keys(formData).length > 0 && <Block form id='editForm' className="form-store-data">
          <Row>
            <Col >
              <List noHairlines>
                <ListInput
                  name={"amount"}
                  type="number"
                  min={0}
                  label="Amount"
                  defaultValue={formData.amount}
                  inner-start={<p>€</p>}
                  placeholder="Enter amount"
                  required
                  onChange={(e) => handleChange({ prop: "amount", value: e.target.value })}
                />
              </List>
            </Col>
            <Col>
              <List noHairlines>
                <ListInput
                  name={"date"}
                  placeholder="Please choose..."
                  label="Expense date"
                  type='datepicker'
                  calendarParams={{
                    events: [{
                      date: dayjs.unix(formData.date.seconds)
                    }],
                    value: [dayjs.unix(formData.date.seconds)],
                    locale: "en",
                    dateFormat: 'dd/mm/yyyy'
                  }}
                  required
                  onCalendarChange={(value) => handleChange({ prop: "date", value: { seconds: dayjs(value[0]).unix() } })}
                />
              </List>
            </Col>
            <Col>
              <List noHairlines>
                <ListInput
                  name={"property"}
                  type="select"
                  placeholder="Please choose..."
                  defaultValue={formData.property}
                  required
                  label="Property"
                  onChange={(e) => handleChange({ prop: "property", value: e.target.value })}
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
                  name={"category"}
                  type="select"
                  defaultValue={formData.category}
                  placeholder="Please choose..."
                  required
                  label="Category"
                  onChange={(e) => handleChange({ prop: "category", value: e.target.value })}
                >
                  {_.sortBy(settings.filter(item => item.docId === 'expenseCategories')[0]?.values, item => item)
                    .map(category => <option key={category} value={category}>{category}</option>)}
                </ListInput>
              </List>
            </Col>
            <Col width="65">
              <List noHairlines>
                <ListInput
                  name={"description"}
                  label="Description"
                  type="textarea"
                  defaultValue={formData.description}
                  resizable
                  required
                  placeholder="Enter description here"
                  onChange={(e) => handleChange({ prop: "description", value: e.target.value })}
                />
              </List>
            </Col>
          </Row>
        </Block >}
      </Page>
    )
  }

  function AddExpenses({ handleClose }) {
    const [rows, setRows] = useState(1)
    const [canSave, setCanSave] = useState(false)
    let [formData, setFormData] = useState([])

    function handleSave() {
      // console.log({ formData })
      let group = _.groupBy(formData, 'index')
      let payloads = Object.keys(group)
        .map(index => {
          let payload = {}
          group[index].forEach(el => {
            if (el.property === 'property') {
              payload[el.property] = doc(db, 'properties', el.value)
            } else if (el.property === 'date') {
              let dateParts = el.value.split("/")
              let date = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`)
              payload[el.property] = date
            } else if (el.property === 'amount') {
              payload[el.property] = Number(el.value)
            } else {
              payload[el.property] = el.value
            }
          })
          return payload
        })
      // console.log({ group, payloads })
      payloads.map(payload => f7.store.dispatch('createOne', { collectionName: 'expenses', payload }))
      handleClose()
    }
    function handleChange() {
      let data = f7.form.convertToData('#expensesForm')
      // console.log({ data })
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
                defaultValue={today}
                placeholder="Please choose..."
                label="Expense date"
                type='datepicker'
                calendarParams={{
                  locale: "en",
                  dateFormat: 'dd/mm/yyyy'
                }}
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
              eventClick={function (info) {
                let expenseId = info.event._def.publicId
                info.jsEvent.preventDefault()
                setExpense(expenses.filter(item => item.docId === expenseId)[0])
                setEditPopupOpen(true)
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
      <Popup
        className="edit"
        opened={editPopupOpen}
        onPopupClosed={handleEditPopupClose}
        onPopupSwipeClose={handleEditPopupClose}
        onPopupClose={handleEditPopupClose}
      >
        <EditExpense handleEditPopupClose={handleEditPopupClose} expense={expense} />
      </Popup>
    </Page>
  );
}

export default ExpensesPage;

