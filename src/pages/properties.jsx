import React, { useEffect, useState } from 'react';
import { Page, Popup, Navbar, Block, Link, Chip, List, ListItem, useStore, CardHeader, CardContent, Segmented, Tabs, Tab, Button, Row, Col, Card, f7 } from 'framework7-react';
import '@fullcalendar/react/dist/vdom';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(isBetween);
dayjs.extend(minMax);
import currency from 'currency.js';
import useFirestoreListener from "react-firestore-listener"

function PropertiesPage({ f7router }) {
  const properties = useFirestoreListener({ collection: "properties" })
  const expenses = useFirestoreListener({ collection: "expenses" })
  const units = useFirestoreListener({ collection: "units" })
  const bookings = useFirestoreListener({ collection: "bookings" })
  const revenue = useFirestoreListener({ collection: "revenue" })
  const tennants = useFirestoreListener({ collection: "tennants" })

  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState();
  const [finance, setFinance] = useState({
    monthlyExpenses: currency(0, { symbol: '€', decimal: ',', separator: '.' }).format(),
    ytdExpenses: currency(0, { symbol: '€', decimal: ',', separator: '.' }).format(),
    monthlyRevenue: currency(0, { symbol: '€', decimal: ',', separator: '.' }).format(),
    ytdRevenue: currency(0, { symbol: '€', decimal: ',', separator: '.' }).format(),
    monthlyProfit: currency(0, { symbol: '€', decimal: ',', separator: '.' }).format(),
    ytdProfit: currency(0, { symbol: '€', decimal: ',', separator: '.' }).format(),
  })

  function getMonthlyFinance() {
    // debugger;
    const monthlyExpenses = expenses
      .filter(item => dayjs(item.date.toDate()).isBetween(dayjs(month).startOf('month'), dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.amount, 0) || 0
    const ytdExpenses = expenses
      .filter(item => dayjs(item.date.toDate()).isBetween(dayjs(month).startOf('year'), dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.amount, 0) || 0
    const monthlyRevenue = revenue
      .filter(item => dayjs(item.date.toDate()).isBetween(dayjs(month).startOf('month'), dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.amount, 0) || 0
    const ytdRevenue = revenue
      .filter(item => dayjs(item.date.toDate()).isBetween(dayjs(month).startOf('year'), dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.amount, 0) || 0
    const monthlyProfit = monthlyRevenue - monthlyExpenses
    const ytdProfit = ytdRevenue - ytdExpenses
    setFinance({
      monthlyExpenses: currency(monthlyExpenses, { symbol: '€', decimal: ',', separator: '.' }).format(),
      ytdExpenses: currency(ytdExpenses, { symbol: '€', decimal: ',', separator: '.' }).format(),
      monthlyRevenue: currency(monthlyRevenue, { symbol: '€', decimal: ',', separator: '.' }).format(),
      ytdRevenue: currency(ytdRevenue, { symbol: '€', decimal: ',', separator: '.' }).format(),
      monthlyProfit: currency(monthlyProfit, { symbol: '€', decimal: ',', separator: '.' }).format(),
      ytdProfit: currency(ytdProfit, { symbol: '€', decimal: ',', separator: '.' }).format(),
    })
  }

  function getUnitData(unitId, propertyId) {
    let propertyRevenue = revenue
      .filter(item => {
        // debugger;
        return (
          item.property.id === propertyId &&
          dayjs(month).month() === dayjs(item.date.toDate()).month() &&
          dayjs(month).year() === dayjs(item.date.toDate()).year()
        )
      })
      .map(item => ({ unit: item.unit.id, amount: item.amount }))
    let propertyRevenueAmount = propertyRevenue.reduce((partialSum, a) => partialSum + a.amount, 0)
    let unitRevenue = propertyRevenue.filter(item => item.unit === unitId)
    let unitRevenueAmount = unitRevenue.reduce((partialSum, a) => partialSum + a.amount, 0)

    let propertyExpenses = expenses
      .filter(item => item.property.id === propertyId)
      .filter(item => dayjs(month).month() === dayjs(item.date.toDate()).month() && dayjs(month).year() === dayjs(item.date.toDate()).year())
      .reduce((partialSum, a) => partialSum + a.amount, 0)
    let currentBookings = bookings
      .filter(item => item.unit.id === unitId)
      .filter(item =>
        dayjs(month).isBefore(dayjs(item.checkIn.toDate())) && dayjs(month).endOf('month').isAfter(dayjs(item.checkIn.toDate)) ||
        dayjs(month).isBefore(dayjs(item.checkOut.toDate())) && dayjs(month).endOf('month').isAfter(dayjs(item.checkOut.toDate())) ||
        dayjs(month).isBetween(dayjs(item.checkIn.toDate()), dayjs(item.checkOut.toDate())) && dayjs(month).endOf('month').isBetween(dayjs(item.checkIn.toDate()), dayjs(item.checkOut.toDate()))
      )
    // debugger;
    let booked_days = currentBookings
      .map(item => {
        let start = dayjs.min(item.checkOut.toDate(), dayjs(month).endOf('month'))
        let end = dayjs.max(item.checkIn.toDate(), dayjs(month))
        let res = dayjs(start).startOf('day').diff(dayjs(end).endOf('day'), 'day') + 1
        return res
      })
      .reduce((partialSum, a) => partialSum + a, 0)
    return {
      property_revenue: currency(propertyRevenueAmount, { symbol: '€', decimal: ',', separator: '.' }).format(),
      property_expenses: currency(propertyExpenses, { symbol: '€', decimal: ',', separator: '.' }).format(),
      property_profit: currency(propertyRevenueAmount, { symbol: '€', decimal: ',', separator: '.' }).subtract(propertyExpenses).format(),
      unit_revenue: currency(unitRevenueAmount, { symbol: '€', decimal: ',', separator: '.' }).format(),
      booked_days: `${booked_days} days`,
      occupancy: `${Number(booked_days * 100 / dayjs(month).daysInMonth()).toFixed(0)}%`
    }
  }

  let calendarRef = React.createRef()

  function handleMonthChange(direction) {

    let calendarApi = calendarRef.current.getApi()
    let currentView = calendarApi.view
    direction === 'prev' && calendarApi.prev()
    direction === 'next' && calendarApi.next()

    setMonth(currentView.currentStart)
  }
  useEffect(() => {
    setMonth(dayjs().startOf('month'))
  }, [])
  useEffect(() => { getMonthlyFinance() }, [month, expenses, revenue])


  useEffect(() => {
    setResources(units.map(unit => {
      let { property_revenue, property_expenses, property_profit, unit_revenue, booked_days } = getUnitData(unit.docId, unit.property.id)
      return ({
        id: unit.docId,
        unit: unit.name,
        property: properties.filter(property => property.docId === unit.property.id)[0].name,
        property_revenue,
        property_expenses,
        property_profit,
        unit_revenue,
        booked_days,
        // occupancy
      })
    }))
  }, [month, bookings])

  useEffect(() => {
    setEvents(bookings.map(booking => {
      return ({
        id: booking.docId,
        title: tennants.filter(tennant => tennant.docId === booking.tennant.id)[0].name,
        start: dayjs(booking.checkIn.toDate()).format('YYYY-MM-DD'),
        end: dayjs(booking.checkIn.toDate()).format('YYYY-MM-DD'),
        allDay: true,
        resourceId: booking.unit.id,
        // color: booking.Type === 'Monthly' ? 'teal' : 'purple'
      })
    }))
  }, [bookings])


  return (
    <Page>
      <Navbar title="Properties">
      </Navbar>
      <Row>
        <Col>
          <Scorecard type="revenue" month={month} finance={finance} />
        </Col>
        <Col>
          <Scorecard type="profit" month={month} finance={finance} />
        </Col>
        <Col>
          <Scorecard type="expenses" month={month} finance={finance} />
        </Col>
      </Row>
      <Block>
        {events && <FullCalendar
          ref={calendarRef}
          height="55vh"
          plugins={[resourceTimelinePlugin]}
          schedulerLicenseKey='CC-Attribution-NonCommercial-NoDerivatives'
          initialView='resourceTimelineMonth'
          resourceOrder='unit,property'
          nowIndicator

          eventClick={function (info) {
            let recordId = info.event._def.publicId
            console.log({ recordId })
            f7router.navigate(`/bookings/${recordId}`)
          }}
          resourceAreaColumns={[
            {
              group: true,
              field: 'property',
              headerContent: 'Property',
              width: 150,
            },
            {
              group: true,
              field: 'property_revenue',
              headerContent: 'Revenue'
            },
            {
              group: true,
              field: 'property_expenses',
              headerContent: 'Expenses'
            },
            {
              group: true,
              field: 'property_profit',
              headerContent: 'Profit'
            },
            {
              field: 'unit',
              headerContent: 'Room'
            },
            {
              // group: true,
              field: 'unit_revenue',
              headerContent: 'Revenue'
            },
            {
              field: 'booked_days',
              headerContent: 'Booked'
            }
          ]}
          resourceAreaWidth='50%'
          resources={resources}
          events={events}
          customButtons={{
            prevMonth: {
              text: '<',
              click: function () {
                handleMonthChange('prev')
              }
            },
            nextMonth: {
              text: '>',
              click: function () {
                handleMonthChange('next')
              }
            }
          }}
          headerToolbar={{
            left: 'today prevMonth nextMonth',
            center: 'title',
            right: ''
          }}
        />}
      </Block>
      {/* <Popup
        className="newProperty"
        opened={popupOpen}
        onPopupClosed={handleClose}
        onPopupSwipeClose={handleClose}
        onPopupClose={handleClose}
      >
        <AddTenant handleClose={handleClose}/>
      </Popup> */}
    </Page>
  );
}

export default PropertiesPage;

const Scorecard = (props) => {
  const { type, month, finance } = props
  let monthly, ytd
  let title, backgroundColor
  switch (type) {
    case "revenue":
      title = "Revenue"
      backgroundColor = "deeppurple"
      monthly = finance.monthlyRevenue
      ytd = finance.ytdRevenue
      break;
    case "expenses":
      title = "Expenses"
      backgroundColor = "deeporange"
      monthly = finance.monthlyExpenses
      ytd = finance.ytdExpenses
      break;
    case "profit":
      title = "Profit"
      backgroundColor = "teal"
      monthly = finance.monthlyProfit
      ytd = finance.ytdProfit
      break;
    default:
      break;
  }
  return (
    <Block textColor='white' inset strong className={`bg-color-${backgroundColor} elevation-10`}>
      <h2 style={{ opacity: 0.8 }}>{title}</h2>
      <h3 style={{ opacity: 0.8 }}>{dayjs(month).format("MMMM")}: {monthly}</h3>
      <h3 style={{ opacity: 0.8 }}>YTD {dayjs(month).format("YYYY")}: {ytd}</h3>
    </Block>
  )
}

