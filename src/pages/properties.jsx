import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, Row, Col, f7 } from 'framework7-react';
import '@fullcalendar/react/dist/vdom';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import currency from 'currency.js';
import useFirestoreListener from "react-firestore-listener"
import _, { property } from 'lodash'
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(isBetween);
dayjs.extend(minMax);
import { getNumberFromString, intersectDateRanges } from '../utils/utils';

function PropertiesPage({ f7router, f7route }) {
  const properties = useFirestoreListener({ collection: "properties" })
  const expenses = useFirestoreListener({ collection: "expenses" })
  const units = useFirestoreListener({ collection: "units" })
  const bookings = useFirestoreListener({ collection: "bookings" })
  const tenants = useFirestoreListener({ collection: "tenants" })
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState();

  const [finance, setFinance] = useState({
    monthlyExpenses: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    ytdExpenses: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    monthlyRevenue: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    ytdRevenue: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    monthlyProfit: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    ytdProfit: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
  })

  // useEffect(() => { console.log({ resources }) }, [resources])

  function getMonthlyFinance() {
    // debugger;
    const monthlyExpenses = expenses
      .filter(item => dayjs(item?.date?.toDate()).isBetween(dayjs(month).startOf('month'), dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.amount, 0) || 0
    const ytdExpenses = expenses
      .filter(item => dayjs(item?.date?.toDate()).isBetween(dayjs(month).startOf('year'), dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.amount, 0) || 0
    const monthlyRevenue = resources
      .reduce((partialSum, a) => partialSum + currency(a.unit_month_revenue).value, 0) || 0
    const ytdRevenue = resources
      .reduce((partialSum, a) => partialSum + currency(a.unit_year_revenue).value, 0) || 0
    const monthlyProfit = monthlyRevenue - monthlyExpenses
    const ytdProfit = ytdRevenue - ytdExpenses
    console.log(resources.filter(item => item.unit_year_revenue !== "€0.00").map(item => ({ id: item.id, unit_year_revenue: item.unit_year_revenue })))
    setFinance({
      monthlyExpenses: currency(monthlyExpenses, { symbol: '€', decimal: '.', separator: ',' }).format(),
      ytdExpenses: currency(ytdExpenses, { symbol: '€', decimal: '.', separator: ',' }).format(),
      monthlyRevenue: currency(monthlyRevenue, { symbol: '€', decimal: '.', separator: ',' }).format(),
      ytdRevenue: currency(ytdRevenue, { symbol: '€', decimal: '.', separator: ',' }).format(),
      monthlyProfit: currency(monthlyProfit, { symbol: '€', decimal: '.', separator: ',' }).format(),
      ytdProfit: currency(ytdProfit, { symbol: '€', decimal: '.', separator: ',' }).format(),
    })
  }

  useEffect(() => { console.log({ finance, resources }) }, [finance])

  function getUnitData(unit) {
    let propertyRevenue = bookings
      .filter(item => item.property.id === unit.property.id)
      .map(item => {
        let monthly = intersectDateRanges([
          { start: dayjs(item.checkIn.toDate()), end: dayjs(item.checkOut.toDate()) },
          { start: dayjs(month).startOf('month'), end: dayjs(month).endOf('month') }
        ])
        let yearly = intersectDateRanges([
          { start: dayjs(item.checkIn.toDate()), end: dayjs(item.checkOut.toDate()) },
          { start: dayjs(month).startOf('year'), end: dayjs(month).endOf('year') }
        ])
        let monthRevenue = 0
        if (item.type === "Short term" || item.type === "Daily") {
          let valid = dayjs(item.checkIn.toDate()).isBetween(dayjs(month).startOf('month'), dayjs(month).endOf('month'))
          if (valid) monthRevenue = item.amount
        } else if (item.type === "Monthly" || item.type === "Long term" && monthly) {
          monthRevenue = item.rent
          if (dayjs(item.checkOut.toDate()).isBefore(dayjs(month).startOf('month').add(10, 'day')) && dayjs(item.checkOut.toDate()).month() === dayjs(month).month()) {
            monthRevenue = 0
          }
        }
        let yearRevenue = 0
        if (yearly) {
          // debugger;
          if (item.type === "Short term" || item.type === "Daily") {
            yearRevenue = item.amount
          } else if (item.type === "Long term" || item.type === "Monthly") {
            let months = dayjs(yearly.end).diff(dayjs(yearly.start), 'month') + 1
            yearRevenue = item.rent * months
          }
        }
        let monthBookedDays = 0
        if (monthly) {
          monthBookedDays = monthly.end.diff(monthly.start, 'day') + 1
        }
        if (unit.name === "Dr Lluch") {
          console.log({ unit: item.unit.id, monthBookedDays, monthRevenue, yearRevenue })
        }
        return ({ unit: item.unit.id, monthBookedDays, monthRevenue, yearRevenue })
      })
    let propertyRevenueAmount = propertyRevenue
      .reduce((partialSum, a) => partialSum + a.monthRevenue, 0)
    let bookedDays = propertyRevenue
      .filter(item => item.unit === unit.docId)
      .reduce((partialSum, a) => partialSum + a.monthBookedDays, 0)
    let unitMonthRevenue = propertyRevenue
      .filter(item => item.unit === unit.docId)
      .reduce((partialSum, a) => partialSum + a.monthRevenue, 0)
    let unitYearRevenue = propertyRevenue
      .filter(item => item.unit === unit.docId)?.[0]?.yearRevenue || 0
    let propertyExpenses = expenses
      .filter(item => item.property.id === unit.property.id)
      .filter(item => dayjs(month).month() === dayjs(item.date.toDate()).month() && dayjs(month).year() === dayjs(item.date.toDate()).year())
      .reduce((partialSum, a) => partialSum + a.amount, 0)
    return {
      property_revenue: currency(propertyRevenueAmount, { symbol: '€', decimal: '.', separator: ',' }).format(),
      property_expenses: currency(propertyExpenses, { symbol: '€', decimal: '.', separator: ',' }).format(),
      property_profit: currency(propertyRevenueAmount, { symbol: '€', decimal: '.', separator: ',' }).subtract(propertyExpenses).format(),
      unit_month_revenue: currency(unitMonthRevenue, { symbol: '€', decimal: '.', separator: ',' }).format(),
      unit_year_revenue: currency(unitYearRevenue, { symbol: '€', decimal: '.', separator: ',' }).format(),
      booked_days: `${bookedDays} days`,
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
    // console.log('f7route.query?.tenantId', f7route.query?.tenantId)
    f7.store.dispatch('setTenantId', { tenantId: f7route.query?.tenantId })
  }, [])

  useEffect(() => {
    setMonth(dayjs().startOf('month'))
  }, [])

  useEffect(() => { getMonthlyFinance() }, [month, expenses, resources])


  useEffect(() => {
    units.length > 0 && setResources(
      units
        .map(unit => {
          let { property_revenue, property_expenses, property_profit, unit_month_revenue, unit_year_revenue, booked_days } = getUnitData(unit)
          return ({
            id: unit.docId,
            unit: unit.name,
            priority: getNumberFromString(unit.name),
            property: properties.filter(property => property.docId === unit.property.id)[0].name,
            property_revenue,
            property_expenses,
            property_profit,
            unit_month_revenue,
            unit_year_revenue,
            booked_days
          })
        }).sort((a, b) => a.priority - b.priority))
  }, [month, bookings])

  useEffect(() => {
    setEvents(bookings.map(booking => {
      return ({
        id: booking.docId,
        title: tenants.filter(tenant => tenant.docId === booking.tenant.id)[0]?.name,
        start: dayjs(booking.checkIn.toDate()).format('YYYY-MM-DD'),
        end: dayjs(booking.checkOut.toDate()).format('YYYY-MM-DD'),
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
          resourceOrder='priority'
          nowIndicator
          eventClick={function (info) {
            let recordId = info.event._def.publicId
            // console.log({ recordId })
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
              field: 'unit_month_revenue',
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
      <h3 style={{ opacity: 0.8 }}>{dayjs(month).format("YYYY")}: {ytd}</h3>
    </Block>
  )
}

