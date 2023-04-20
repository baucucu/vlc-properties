import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, List, ListItem, ListInput, Row, Col, Popup, NavRight, Button, Icon, f7, Toolbar, Link, Tabs, Tab } from 'framework7-react';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import currency from 'currency.js';
import dayjs from 'dayjs';
import _ from 'lodash';
import useFirestoreListener from "react-firestore-listener"
import { doc } from 'firebase/firestore'
import { db } from '../utils/firebase'
import store from '../js/store';
import { intersectDateRanges } from '../utils/utils';


const ExpensesPage = () => {
  const properties = useFirestoreListener({ collection: "properties" })
  const expenses = useFirestoreListener({ collection: "expenses" })
  const bookings = useFirestoreListener({ collection: "bookings" })
  const [selected, setSelected] = useState([])
  const [cashEvents, setCashEvents] = useState([])
  const [expenseEvents, setExpenseEvents] = useState([])
  const [popupOpen, setPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [expense, setExpense] = useState({})
  const [selectAll, setSelectAll] = useState(true)
  const [totalIn, setTotalIn] = useState(0)
  const [totalOut, setTotalOut] = useState(0)
  const [currentDates, setCurrentDates] = useState({})
  const [currentCashDates, setCurrentCashDates] = useState({})
  const [cashTotal, setCashTotal] = useState(0)


  function handleClose() {
    setPopupOpen(false);
  }
  function handleEditPopupClose() {
    setEditPopupOpen(false);
  }
  function handleSelectAll(e) {
    setSelectAll(e.target.checked)
  }

  useEffect(() => {
    if (selectAll) {
      setSelected(properties.map(item => item.docId))
    } else {
      setSelected([])
    }
  }, [selectAll])

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
    return (() => {
      ss.off('change')
      ss.off('close')
    })
  }, [])

  useEffect(() => {
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
            amount: item.amount,
            property: property.name,
            category: item.category,
            description: item.description,
            docId: item.docId,
          }
        })
      })
    console.log({ evs })
    setExpenseEvents(evs.filter(item => item.extendedProps.category !== 'Cash in'))
    setCashEvents(evs.filter(item => ['Cash in', 'Cash payment', 'Commissions'].includes(item.extendedProps.category)))
    const ss = f7.smartSelect.get('.smart-select')
    ss.setValue(selected)

  }, [selected, expenses])


  useEffect(() => {
    let total = cashEvents
      .filter(item => currentCashDates?.end ? dayjs(item.start).isBefore(currentCashDates.end) : true)
      // .filter(item => ['Cash in', 'Cash payment'].includes(item.category))
      .reduce((acc, item) => {
        if (['Cash in'].includes(item.extendedProps.category)) {
          return acc + item.extendedProps.amount
        } else {
          return acc - item.extendedProps.amount
        }
      }, 0)
    setCashTotal(total)
    console.log({ cashTotal, cashEvents, currentCashDates })
  }, [currentCashDates, cashEvents])

  useEffect(() => {
    const monthOut = [...expenseEvents]
      .filter(item => dayjs(item.start).isAfter(currentDates.start) && dayjs(item.start).isBefore(currentDates.end))
      .filter(item => item.extendedProps.amount > 0)
      .filter(item => item.extendedProps.category !== 'Cash in')
      .reduce((acc, item) => acc + item.extendedProps.amount, 0)
    let monthRevenue = 0
    let month = dayjs(currentDates.start)
    bookings
      .filter(item => selected.includes(item.property.id))
      .forEach(item => {
        // console.log({ item })
        let monthly = intersectDateRanges([
          { start: dayjs(item.checkIn.toDate()), end: dayjs(item.checkOut.toDate()) },
          { start: dayjs(month).startOf('month'), end: dayjs(month).endOf('month') }
        ])
        if (monthly) {
          if (
            (dayjs(item.checkIn.toDate()).isSameOrAfter(dayjs(month).startOf('month'), "month") && dayjs(item.checkOut.toDate()).isSameOrBefore(dayjs(month).endOf('month'), "month"))
            || (dayjs(item.checkIn.toDate()).isSameOrBefore(dayjs(month).startOf('month'), "month") && dayjs(item.checkOut.toDate()).isSameOrAfter(dayjs(month).endOf('month'), "month"))
            || (dayjs(item.checkIn.toDate()).isSameOrBefore(dayjs(month).startOf('month'), "month") && dayjs(item.checkOut.toDate()).isSameOrAfter(dayjs(month).startOf('month').add(10, "days"), "month"))
          ) {
            monthRevenue += item.rent
          }
        }
      })
    setTotalIn(monthRevenue)
    setTotalOut(monthOut)
  }, [currentDates, expenseEvents, cashEvents, bookings, selected])


  return (
    <Page>
      <Navbar title="Finance">
        <Button onClick={() => setPopupOpen(true)}>
          <Icon material="add" />
        </Button>
      </Navbar>
      <Toolbar tabbar top>
        <Link tabLink="#expenses" tabLinkActive>
          Expenses
        </Link>
        <Link tabLink="#cash">Cash balance: {currency(cashTotal, { symbol: '€', decimal: ',', separator: '.' }).format()}</Link>
      </Toolbar>
      <Tabs>
        <Tab id='expenses' tabActive>
          <Row>
            <Col>
              <Block>
                <List>
                  <ListItem checkbox title={selectAll ? "Deselect all" : "Select all"} checked={selectAll} onChange={handleSelectAll}>
                  </ListItem>
                  <ListItem title="Filter properties" smartSelect id="propertiesFilter" smartSelectParams={{ openIn: 'popover' }} >
                    <select className="filter" name="filter" multiple >
                      {_.sortBy(properties, item => item.name).map(item => <option key={item.docId} value={item.docId}>{item.name}</option>)}
                    </select>
                  </ListItem>
                </List>
                <List>
                  <ListItem title="Revenue" after={currency(totalIn, { symbol: '€', decimal: ',', separator: '.' }).format()}></ListItem>
                  <ListItem title="Expenses" after={currency(totalOut, { symbol: '€', decimal: ',', separator: '.' }).format()}></ListItem>
                  <ListItem title="Balance" after={currency(totalIn - totalOut, { symbol: '€', decimal: ',', separator: '.' }).format()}></ListItem>
                </List>
                <FullCalendar
                  height="70vh"
                  initialView="listMonth"
                  events={expenseEvents}
                  plugins={[listPlugin]}
                  eventDidMount={function (info) {
                    const propertyEl = info.el.getElementsByClassName('fc-list-event-time')[0]
                    propertyEl.innerHTML = info.event.extendedProps.property
                    const amountEl = info.el.getElementsByClassName('fc-list-event-dot')[0];
                    amountEl.style.display = "none";
                  }}
                  eventClick={function (info) {
                    let expenseId = info.event._def.publicId
                    info.jsEvent.preventDefault()
                    setExpense(expenses.filter(item => item.docId === expenseId)[0])
                    setEditPopupOpen(true)
                  }}
                  datesSet={function (info) {
                    console.log(info)
                    setCurrentDates(info)
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
        </Tab>
        <Tab id='cash' >
          <Block>
            <FullCalendar
              height="70vh"
              initialView="listMonth"
              events={cashEvents}
              plugins={[listPlugin]}
              eventDidMount={function (info) {
                const propertyEl = info.el.getElementsByClassName('fc-list-event-time')[0]
                propertyEl.innerHTML = info.event.extendedProps.property
                const amountEl = info.el.getElementsByClassName('fc-list-event-dot')[0];
                amountEl.style.display = "none";
              }}
              eventClick={function (info) {
                let eventId = info.event._def.publicId
                info.jsEvent.preventDefault()
                setExpense(expenses.filter(item => item.docId === eventId)[0])
                setEditPopupOpen(true)
              }}
              datesSet={function (info) {
                console.log(info)
                setCurrentCashDates(info)
              }}
              headerToolbar={{
                left: 'today prev next',
                center: 'title',
                right: ''
              }}
            />
          </Block>
        </Tab>
      </Tabs>

      <Popup
        className="expenses"
        opened={popupOpen}
        onPopupClosed={handleClose}
        onPopupSwipeClose={handleClose}
        onPopupClose={handleClose}
      >
        <AddExpenses handleClosePopup={handleClose} />
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

function EditExpense({ handleEditPopupClose, expense }) {
  const [formData, setFormData] = useState({})
  const properties = useFirestoreListener({ collection: "properties" })
  const settings = useFirestoreListener({ collection: "settings" })

  function handleClose() {
    setFormData({})
    handleEditPopupClose()
  }

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
      handleClose()
    })
  }

  function handleDelete() {
    f7.dialog.confirm('Are you sure you want to delete this expense?', 'Delete expense', () => {
      store.dispatch('deleteOne', { collectionName: 'expenses', id: expense.docId }).then(res => {
        // console.log({ res })
        handleClose()
      })
    })
  }
  return (
    <Page>
      <Navbar title="Edit">
        <Button onClick={handleSave}><Icon material='save' /></Button>
        <Button onClick={() => handleDelete()}>Delete</Button>
        <NavRight>
          <Button onClick={handleClose}>
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
                label="Date"
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

function AddExpenses({ handleClosePopup }) {
  const [rows, setRows] = useState(1)
  const [canSave, setCanSave] = useState(false)
  let [formData, setFormData] = useState([])

  function handleClose() {
    setFormData([])
    setRows(0)
    setRows(1)
    handleClosePopup()
  }

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
            let date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T14:00:00`)
            payload[el.property] = date
          } else if (el.property === 'amount') {
            payload[el.property] = Number(el.value)
          } else {
            payload[el.property] = el.value
          }
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
      <Navbar title="Add new item">
        {canSave && <Button onClick={handleSave}><Icon material='save' /></Button>}
        <NavRight>
          <Button onClick={() => { setFormData([]); handleClose(); }}>
            <Icon material="close"></Icon>
          </Button>
        </NavRight>
      </Navbar>
      <form id="expensesForm" className="form-store-data">
        <Block>
          {[...Array(rows).keys()].map(index => <ExpenseRow key={index} handleChange={handleChange} index={index} />)}
          <Button onClick={() => setRows(rows + 1)}>Add new item</Button>
        </Block>
      </form>

    </Page>

  )
}

const ExpenseRow = ({ index, handleChange }) => {
  const properties = useFirestoreListener({ collection: "properties" })
  const settings = useFirestoreListener({ collection: "settings" })
  const [formData, setFormData] = useState({
    amount: 0,
    date: dayjs().format('DD.MM.YYYY'),
    property: "",
    category: 'Cash in',
  })

  useEffect(() => {
    handleChange({ prop: "amount", value: formData.amount })
    handleChange({ prop: "date", value: formData.date })
    handleChange({ prop: "property", value: formData.property })
    handleChange({ prop: "category", value: formData.category })
  }, [formData])

  const today = dayjs().format('DD.MM.YYYY')
  return (
    <Block>
      <h4>Item #{index + 1}</h4>
      <Row>
        <Col >
          <List noHairlines>
            <ListInput
              name={index + ".amount"}
              type="number"
              min={0}
              value={formData.amount}
              label="Amount"
              inner-start={<p>€</p>}
              placeholder="Enter amount"
              required
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </List>
        </Col>
        <Col>
          <List noHairlines>
            <ListInput
              name={index + ".date"}
              value={formData.date}
              placeholder="Please choose..."
              label="Expense date"
              type='datepicker'
              calendarParams={{
                locale: "en",
                dateFormat: 'dd/mm/yyyy'
              }}
              required
              onCalendarChange={(value) => setFormData({ ...formData, date: value })}
            />
          </List>
        </Col>
        <Col>
          <List noHairlines>
            <ListInput
              name={index + ".property"}
              type="select"
              value={formData.property}
              placeholder="Please choose..."
              required
              label="Property"
              onChange={(event, value) => setFormData({ ...formData, property: value })}
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
              calue={formData.category}
              placeholder="Please choose..."
              required
              label="Category"
              onChange={(event, value) => setFormData({ ...formData, category: value })}
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
              value={formData.description}
              resizable
              required
              placeholder="Enter description here"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </List>
        </Col>
      </Row>

    </Block >
  )
}

export default ExpensesPage;

