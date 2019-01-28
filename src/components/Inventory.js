import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase/app";
import AddFishForm from "./AddFishForm";
import EditFishForm from "./EditFishForm";
import Login from "./Login";
import base, { firebaseApp } from "../base";
import Logout from "./Logout";

class Inventory extends React.Component {
  static propTypes = {
    fishes: PropTypes.object.isRequired,
    updateFish: PropTypes.func.isRequired,
    deleteFish: PropTypes.func.isRequired,
    addFish: PropTypes.func.isRequired,
    loadSampleFishes: PropTypes.func.isRequired,
    storeId: PropTypes.string.isRequired
  };

  state = {
    uid: null,
    owner: null
  };
  componentDidMount() {
    //On Refresh check out if the user was logeed in
    firebase.auth().onAuthStateChanged(user => {
      if (user) this.authHandler({ user });
    });
  }

  authHandler = async authData => {
    //1.Look up the current store in Firebase Database
    const store = await base.fetch(this.props.storeId, { context: this });
    //2. Claim it there`s no previous owner
    if (!store.owner) {
      await base.post(`${this.props.storeId}/owner`, {
        data: authData.user.uid
      });
    }
    //3. Set the state of the <Inventory> to reflect the current user
    this.setState({
      currentUser: authData.user.uid,
      shopOwner: store.owner || authData.user.uid
    });
  };

  authenticate = provider => {
    //Right now it`s only `firebase.auth.GithubAuthProvider()`
    const authProvider = new firebase.auth[`${provider}AuthProvider`]();
    firebaseApp
      .auth()
      .signInWithPopup(authProvider)
      .then(this.authHandler);
  };
  logout = async () => {
    await firebase.auth().signOut();
    this.setState({ currentUser: null });
  };

  render() {
    const amINotLoggedIn = !this.state.currentUser;
    if (amINotLoggedIn) {
      return <Login authenticate={this.authenticate} />;
    }
    const amINotTheOwner = this.state.currentUser !== this.state.shopOwner;
    if (amINotTheOwner) {
      return (
        <div>
          <p>Sorry you are not the owner!</p>
          <Logout logout={this.logout} />
        </div>
      );
    }
    return (
      <div className="inventory">
        <h2>Inventory</h2>
        {Object.keys(this.props.fishes).map(fishKey => (
          <EditFishForm
            key={fishKey}
            fishKey={fishKey}
            updateFish={this.props.updateFish}
            deleteFish={this.props.deleteFish}
            fish={this.props.fishes[fishKey]}
          />
        ))}
        <AddFishForm addFish={this.props.addFish} />
        <button onClick={this.props.loadSampleFishes}>Add Fish Samples</button>
      </div>
    );
  }
}

export default Inventory;
