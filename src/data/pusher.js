import firebase from 'firebase';

class Pusher {
  constructor(code) {
    this.code = code;
  }

  pushExpensesData = async data => {
    console.log('Data to push and code', data, this.code);
    let snapshot = await firebase
      .database()
      .ref(`/${this.code}/expenses`)
      .update(data)
      .then(val => console.log('In PUSHER', val));
    return snapshot;
  };

  pushShoppingList = async list => {
    return await firebase
      .database()
      .ref(`/${this.code}/shopping/`)
      .set(list);
  };

  /**
   * @param {number} index Which item in the list should be updated.
   * @param {boolean} active The new value of the list's item.
   */
  updateShoppingList = async (index, active) => {
    return await firebase
      .database()
      .ref(`/${this.code}/shopping/${index}/`)
      .update(active);
  };

  fetchShoppingList = async () => {
    let snapshot = await firebase
      .database()
      .ref(`/${this.code}/shopping`)
      .once('value');
    return snapshot.val();
  };
}

export default Pusher;
