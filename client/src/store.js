import { createStore } from "redux";
import rotateReducer from "./reducers/rotateReducer.js";

function configureStore(state = { rotating: true }) {
  return createStore(rotateReducer,state);
}

export default configureStore;