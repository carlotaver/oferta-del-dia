import React from "react";
import { formatPrice } from "../helpers";

class Order extends React.Component {
  handleRemove = event => {
    // NOTE: There's got to be a better way to do 👇
    const orderKey = event.target.parentNode.attributes.orderkey.value;
    this.props.removeFromOrder(orderKey);
  };
  totalReducer = (subTotal, value) => {
    const fish = this.props.fishes[value];
    const quantity = this.props.order[value];
    const isAvailable = fish && fish.status === "available";

    return isAvailable ? quantity * fish.price + subTotal : subTotal;
  };

  renderOrder = orderKey => {
    const quantity = this.props.order[orderKey];
    const fish = this.props.fishes[orderKey];
    const isAvailable = fish && fish.status === "available";

    if (!fish) return null;

    if (isAvailable) {
      return (
        <li key={orderKey} orderkey={orderKey}>
          {quantity} lbs {fish.name}
          {formatPrice(quantity * fish.price)}
          <button onClick={this.handleRemove}>&times;</button>
        </li>
      );
    } else {
      return (
        <li key={orderKey}>
          Sorry {fish ? fish.name : "product"} is not available!
        </li>
      );
    }
  };

  render() {
    const orderIds = Object.keys(this.props.order);
    const total = orderIds.reduce(this.totalReducer, 0);

    return (
      <div className="order-wrap">
        <h2>Your Order</h2>
        <ul className="order">{orderIds.map(this.renderOrder)}</ul>
        <div className="total">
          Total: <strong>{formatPrice(total)}</strong>
        </div>
      </div>
    );
  }
}

export default Order;
