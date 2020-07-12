import pusher from '../data/pusher';
import Pusher from '../data/pusher';

class DataStore {
  data = {};
  markedDates = {};
  dayExpenses = [];
  history = [];
  daysTotal = 0;

  //priv
  selectedDay = '';

  constructor(data, code) {
    this.data = data;
    Object.keys(this.data).map((day, i) => {
      this.markedDates[day] = {marked: true};
    });
    this.pusher = new Pusher(code);
  }

  addExpense = (day, category, amount) => {
    if (amount === 0 || null) return;

    //Add expense to category's previous total
    this.data[day] = this.data[day] || {expenses: {}, history: {}};
    this.data[day].expenses[category] = this.data[day].expenses[category] || 0;
    this.data[day].expenses[category] += parseInt(amount);
    this.setDaysExpenses(day);

    //Add transaction to history
    this.data[day].history = this.data[day].history || {};
    this.data[day].history[category] = this.data[day].history[category] || [];
    this.data[day].history[category].push({
      amount: parseInt(amount),
      date: Date.now(),
    });

    //Mark day on the calendar
    this.markedDates = {
      ...this.markedDates,
      [day]: {...this.markedDates[day], marked: true},
    };

    this.pusher.pushExpensesData(this.data);
  };

  selectDay = day => {
    //Marked day as selected
    this.markedDates = {
      ...this.markedDates,
      [day]: {
        ...this.markedDates[day],
        selected: true,
        disableTouchEvent: false,
      },
    };

    //De-select previously selected day
    if (this.selectedDay !== null)
      this.markedDates = {
        ...this.markedDates,
        [this.selectedDay]: {
          ...this.markedDates[this.selectedDay],
          selected: false,
          disableTouchEvent: false,
        },
      };

    this.selectedDay = day;

    this.setDaysExpenses(day);
  };

  setDaysExpenses = day => {
    //Check if day exists
    if (day === undefined || day === null) return (this.dayExpenses = []);

    //Check if there's data available for that day
    if (this.data[day] == null) return (this.dayExpenses = []);

    let dayData = this.data[day].expenses || null;
    this.history = this.data[day].history;

    this.dayExpenses = Object.keys(dayData).map((key, index) => {
      return {key: key, amount: dayData[key]};
    });

    this.setDaysTotal(day);
  };

  setDaysTotal = day => {
    if (this.dayExpenses.length <= 0) {
      this.daysTotal = 0;
      return;
    }

    let dailyExpensesSum = 0;

    for (let index = 0; index < this.dayExpenses.length; index++) {
      dailyExpensesSum += this.dayExpenses[index].amount;
    }

    this.daysTotal = dailyExpensesSum;
  };

  getDaysTotal = () => {
    return this.daysTotal;
  };

  getMontsCategoriesTotals = month => {
    let totals = {};

    Object.keys(this.data).map((day, i) => {
      if (day.indexOf(month) == -1) return null;

      Object.keys(this.data[day].expenses).map((category, i) => {
        totals[category] = totals[category] || 0;
        totals[category] += this.data[day].expenses[category];
      });
    });

    return totals;
  };

  getMontsTotal = month => {
    let total = 0;
    let categoriesTotal = this.getMontsCategoriesTotals(month);

    Object.keys(categoriesTotal).map((category, i) => {
      total += categoriesTotal[category];
    });

    return total;
  };

  updateDaysData = (day, category, value) => {
    if (value <= 0) {
      delete this.data[day].expenses[category];

      if (Object.keys(this.data[day].expenses).length === 0) {
        this.markedDates = {
          ...this.markedDates,
          [day]: {...this.markedDates[day], marked: false},
        };
      }
    } else {
      this.data[day].expenses[category] = value;
    }

    this.setDaysExpenses(day);
    this.pusher
      .pushExpensesData(this.data)
      .then(val => console.log('Updated', val))
      .catch(reason => console.log('Reason', reason));
  };
}

export default DataStore;
